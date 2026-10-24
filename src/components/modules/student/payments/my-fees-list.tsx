"use client";

import { CircleDollarSign, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { StudentFee, StudentInstallment } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelFeePayment, useDownloadReceipt, useInitBkashPayment, useMyFees } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

/* Small helpers — keep the UI code below easy to read. */

function formatMoney(amount: number) {
  return `৳${amount.toLocaleString()}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function feeBadgeVariant(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIALLY_PAID") return "warning" as const;
  return "destructive" as const;
}

function isPaid(i: StudentInstallment) {
  return i.status === "PAID";
}

/* One fee card ---------------------------------------------- */

function FeeCard({ fee }: { fee: StudentFee }) {
  const payNow = useInitBkashPayment();
  const cancel = useCancelFeePayment();
  const receipt = useDownloadReceipt();
  const busy = payNow.isPending || cancel.isPending;

  const total = fee.installments.length;
  const progress = fee.amount > 0 ? Math.min(100, Math.round((fee.paidAmount / fee.amount) * 100)) : 0;

  // Backend rule: pay lowest-numbered unpaid first.
  const firstUnpaid = fee.installments.find((i) => !isPaid(i));
  // Backend rule: only the latest paid installment is refundable.
  const lastPaid = [...fee.installments].reverse().find((i) => isPaid(i) && i.payment?.status === "PAID");
  const canCancel = fee.type !== "ADMISSION" && lastPaid !== undefined;

  function handlePay(installment: StudentInstallment) {
    payNow.mutate(installment.id, {
      onSuccess: (data) => {
        window.location.href = data.bkashURL;
      },
      onError: (err) => {
        // e.g. "Please pay installment N first" when paying out of order.
        toast.error(getApiErrorMessage(err, "Could not start payment."));
      },
    });
  }

  function handleCancel() {
    if (!lastPaid) return;
    const ok = window.confirm(`Cancel installment ${lastPaid.number}? A refund will be requested.`);
    if (!ok) return;
    cancel.mutate(lastPaid.id, {
      onSuccess: () => toast.success("Payment cancelled, refund requested."),
      onError: (err) => {
        // e.g. "Cancel installment N first" or refund window closed.
        toast.error(getApiErrorMessage(err, "Could not cancel payment."));
      },
    });
  }

  const title = fee.type === "ADMISSION" ? "Admission fee" : (fee.semester?.name ?? "Tuition fee");

  function handleReceipt(paymentId: string, label: string) {
    receipt.mutate(
      { paymentId, filename: `receipt-${label}.pdf` },
      {
        onSuccess: () => toast.success("Receipt downloaded."),
        onError: (err) => toast.error(getApiErrorMessage(err, "Receipt download failed.")),
      },
    );
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide">
            <span className="text-primary">{title}</span>
            <Badge variant={fee.type === "ADMISSION" ? "secondary" : "success"}>{fee.type}</Badge>
          </p>
          {fee.invoiceNo ? (
            <p className="mt-0.5 text-xs text-muted-foreground">Invoice {fee.invoiceNo}</p>
          ) : null}
          <h3 className="mt-1 text-xl font-bold tracking-tight">
            {formatMoney(fee.paidAmount)} <span className="text-sm font-medium text-muted-foreground">/ {formatMoney(fee.amount)}</span>
          </h3>
        </div>
        <Badge variant={feeBadgeVariant(fee.status)}>{fee.status.replace("_", " ")}</Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Invoice lines + waiver (frozen snapshot from the fee policy). */}
      {fee.items && fee.items.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
          {fee.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums">{formatMoney(item.amount)}</span>
            </li>
          ))}
          {(fee.discountAmount ?? 0) > 0 ? (
            <li className="flex items-center justify-between gap-2 font-medium text-success">
              <span>Waiver / discount</span>
              <span className="tabular-nums">−{formatMoney(fee.discountAmount ?? 0)}</span>
            </li>
          ) : null}
          {(fee.adjustmentAmount ?? 0) !== 0 ? (
            <li className="flex items-center justify-between gap-2 font-medium">
              <span>Adjustment</span>
              <span className="tabular-nums">{(fee.adjustmentAmount ?? 0) > 0 ? "+" : ""}{formatMoney(fee.adjustmentAmount ?? 0)}</span>
            </li>
          ) : null}
        </ul>
      ) : null}

      {/* One installment = single Pay button, no table. */}
      {total <= 1 && firstUnpaid ? (
        <div className="mt-auto pt-1">
          <Button type="button" onClick={() => handlePay(firstUnpaid)} disabled={busy}>
            {payNow.isPending ? "Opening bKash…" : `Pay ${formatMoney(firstUnpaid.amount)} with bKash`}
          </Button>
        </div>
      ) : null}

      {/* Receipt for a single-installment fee that's already paid. */}
      {total <= 1 && !firstUnpaid && fee.installments[0]?.payment?.id ? (
        <div className="mt-auto pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={receipt.isPending}
            onClick={() =>
              handleReceipt(fee.installments[0].payment!.id, fee.invoiceNo ?? fee.id)
            }
          >
            <Download className="size-4" />
            {receipt.isPending ? "Downloading…" : "Download receipt"}
          </Button>
        </div>
      ) : null}

      {/* Many installments = table, pay only the first unpaid one. */}
      {total > 1 ? (
        <ul className="flex flex-col gap-2">
          {fee.installments.map((i) => {
            const payable = firstUnpaid?.id === i.id;
            return (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold">Installment {i.number} of {total}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDate(i.dueDate)} · {formatMoney(i.amount)}</p>
                  {isPaid(i) && i.payment?.trxId ? (
                    <p className="text-xs text-muted-foreground">Trx: {i.payment.trxId}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {i.isOverdue && !isPaid(i) ? <Badge variant="destructive">Overdue</Badge> : null}
                  <Badge variant={isPaid(i) ? "success" : "warning"}>{i.status.replace("_", " ")}</Badge>
                  {isPaid(i) && i.payment?.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={receipt.isPending}
                      onClick={() => handleReceipt(i.payment!.id, `${fee.invoiceNo ?? fee.id}-${i.number}`)}
                    >
                      <Download className="size-3.5" />
                      Receipt
                    </Button>
                  ) : null}
                  {!isPaid(i) ? (
                    <Button type="button" size="sm" onClick={() => handlePay(i)} disabled={!payable || busy} title={payable ? "Pay with bKash" : "Pay earlier installments first"}>
                      {payNow.isPending && payNow.variables === i.id ? "Opening…" : "Pay"}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {fee.status === "PAID" ? (
        <p className="text-[13px] font-medium text-success">Fully paid. Thank you!</p>
      ) : null}

      {canCancel ? (
        <div className="mt-auto pt-1">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={busy}>
            {cancel.isPending ? "Cancelling…" : `Cancel installment ${lastPaid?.number} & Refund`}
          </Button>
        </div>
      ) : null}
    </li>
  );
}

/* Main list -------------------------------------------------- */

export default function MyFeesList() {
  const query = useMyFees();
  const fees = query.data ?? [];

  const totalDue = fees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const unpaid = fees.flatMap((f) =>
    f.installments.filter((i) => i.status !== "PAID").map((i) => ({ ...i, fee: f })),
  );
  const overdueCount = unpaid.filter((i) => i.isOverdue).length;
  const nextDue = unpaid
    .slice()
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader title="My fees" subtitle="Pay tuition in monthly installments with bKash." />

      {query.isLoading ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="rounded-2xl border bg-card p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-7 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
            </li>
          ))}
        </ul>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load fees</p>
          <p className="text-[13px] text-muted-foreground">{getApiErrorMessage(query.error, "Try again in a moment.")}</p>
          <button type="button" onClick={() => query.refetch()} className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted">
            Retry
          </button>
        </div>
      ) : fees.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <Receipt className="size-5" />
          </span>
          <p className="text-sm font-semibold">No fees yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">Fees appear here once an admin generates them for your semester.</p>
        </div>
      ) : (
        <>
          <DashboardPanel title="Summary" subtitle={`${fees.length} fee${fees.length > 1 ? "s" : ""} total`}>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-6">
                <p className="flex items-center gap-2 text-sm">
                  <CircleDollarSign className="size-4 text-warning" />
                  Due: <strong>{formatMoney(totalDue)}</strong>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CircleDollarSign className="size-4 text-success" />
                  Paid: <strong>{formatMoney(totalPaid)}</strong>
                </p>
                {overdueCount > 0 ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    {overdueCount} overdue
                  </p>
                ) : null}
              </div>
              {nextDue ? (
                <p className="text-[13px] text-muted-foreground">
                  Next due: <strong className="text-foreground">{formatMoney(nextDue.amount)}</strong>
                  {" "}· {nextDue.fee.type === "ADMISSION" ? "Admission fee" : (nextDue.fee.semester?.name ?? "Tuition")}
                  {" "}· {formatDate(nextDue.dueDate)}
                  {nextDue.isOverdue ? <span className="font-semibold text-destructive"> · overdue</span> : null}
                </p>
              ) : (
                <p className="text-[13px] font-medium text-success">All clear — nothing due.</p>
              )}
            </div>
          </DashboardPanel>

          <ul className="grid items-start gap-3 md:grid-cols-2">
            {fees.map((fee) => (
              <FeeCard key={fee.id} fee={fee} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
