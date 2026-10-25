"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Invoice } from "@/api/invoices.api";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInitPayment,
  useMyAdmissionApplication,
  useMyInvoiceSummary,
  useMyInvoices,
} from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatBDT, formatDueDate } from "@/lib/format";
import { redirectToBkash } from "@/lib/payment";

type TypeFilter = "ALL" | "APPLICATION" | "ADMISSION" | "SEMESTER";

function statusVariant(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIALLY_PAID") return "warning" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
}

// Never compute money here — only render payable / paid / outstanding.
function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const pay = useInitPayment();
  const [amount, setAmount] = useState("");
  // "Next" means the lowest-numbered installment that is not settled.
  const next =
    invoice.installments
      .slice()
      .sort((a, b) => a.number - b.number)
      .find((i) => i.status !== "PAID") ?? null;
  const progress =
    invoice.payableAmount > 0
      ? Math.min(
          100,
          Math.round((invoice.paidAmount / invoice.payableAmount) * 100),
        )
      : 0;

  function handlePay() {
    if (!next) return;
    const payload: { invoiceId: string; amount?: number } = {
      invoiceId: invoice.id,
    };
    if (invoice.allowPartialPayment && amount.trim()) {
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0 || n > next.remaining) {
        toast.error(
          `Enter an amount between 1 and ${formatBDT(next.remaining)}.`,
        );
        return;
      }
      payload.amount = n;
    }
    pay.mutate(payload, {
      onSuccess: (data) => {
        if (!data?.bkashURL) {
          toast.error("The payment gateway did not return a bKash URL.");
          return;
        }
        sessionStorage.setItem("payReturnTo", "/student/payments/my-fees");
        window.location.href = data.bkashURL;
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not start payment.")),
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold">
            {invoice.type.charAt(0) + invoice.type.slice(1).toLowerCase()}{" "}
            invoice
          </p>
          {invoice.invoiceNumber ? (
            <p className="text-xs text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(invoice.status)}>
          {invoice.status.replace("_", " ")}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-[11px] text-muted-foreground">Payable</dt>
          <dd className="mt-0.5 font-bold tabular-nums">
            {formatBDT(invoice.payableAmount)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-[11px] text-muted-foreground">Paid</dt>
          <dd className="mt-0.5 font-bold tabular-nums text-success">
            {formatBDT(invoice.paidAmount)}
          </dd>
        </div>
        <div className="rounded-xl bg-destructive/[0.07] p-3">
          <dt className="text-[11px] text-muted-foreground">Due</dt>
          <dd className="mt-0.5 font-bold tabular-nums text-destructive">
            {formatBDT(invoice.outstandingBalance)}
          </dd>
        </div>
      </dl>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtotal / Discounts / Adjustments */}
      {(invoice.subtotal > 0 ||
        invoice.discountTotal > 0 ||
        invoice.adjustmentTotal !== 0) && (
        <dl className="grid grid-cols-3 gap-2 text-center text-[12px]">
          <div className="rounded-xl bg-muted/30 p-2">
            <dt className="text-[10px] text-muted-foreground">Subtotal</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatBDT(invoice.subtotal)}
            </dd>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="rounded-xl bg-success/10 p-2">
              <dt className="text-[10px] text-success">Discounts</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-success">
                −{formatBDT(invoice.discountTotal)}
              </dd>
            </div>
          )}
          {invoice.adjustmentTotal !== 0 && (
            <div className="rounded-xl bg-warning/10 p-2">
              <dt className="text-[10px] text-warning">Adjustments</dt>
              <dd
                className={`mt-0.5 font-medium tabular-nums ${invoice.adjustmentTotal < 0 ? "text-success" : "text-destructive"}`}
              >
                {invoice.adjustmentTotal < 0 ? "−" : "+"}
                {formatBDT(Math.abs(invoice.adjustmentTotal))}
              </dd>
            </div>
          )}
        </dl>
      )}

      {invoice.items.length > 0 ? (
        <ul className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          {invoice.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2"
            >
              <span>
                {item.description} × {item.quantity}
                {item.isRefundable ? (
                  <span className="ml-1 text-[11px] text-success">
                    (Refundable)
                  </span>
                ) : null}
              </span>
              <strong className="text-foreground tabular-nums">
                {formatBDT(item.amount)}
              </strong>
            </li>
          ))}
        </ul>
      ) : null}

      {invoice.installments.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {invoice.installments
            .slice()
            .sort((a, b) => a.number - b.number)
            .map((inst) => (
              <li
                key={inst.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[13px] ${inst.isOverdue ? "border-destructive/40 bg-destructive/5" : ""}`}
              >
                <span>
                  Installment {inst.number} · due {formatDueDate(inst.dueDate)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums">
                    {formatBDT(inst.remaining)} left
                  </span>
                  <Badge
                    variant={
                      inst.isOverdue
                        ? "destructive"
                        : inst.status === "PAID"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {inst.isOverdue ? "Overdue" : inst.status.replace("_", " ")}
                  </Badge>
                </span>
              </li>
            ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {next && invoice.status !== "CANCELLED" ? (
          <>
            {invoice.allowPartialPayment ? (
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Amount (max ${next.remaining})`}
                type="number"
                className="h-9 w-44"
              />
            ) : null}
            <Button size="sm" disabled={pay.isPending} onClick={handlePay}>
              {pay.isPending ? "Starting…" : `Pay ${formatBDT(next.remaining)}`}
            </Button>
          </>
        ) : null}
        <Link
          href={`/student/invoices/${invoice.id}`}
          className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
        >
          Details & transactions →
        </Link>
      </div>
    </li>
  );
}

// Shown when the invoice list is empty but an admission invoice is still owed —
// the student gets the amount and a Pay button right here.
function AdmissionFeePrompt({
  invoiceId,
  invoiceNumber,
  due,
}: {
  invoiceId: string;
  invoiceNumber: string | null;
  due: number;
}) {
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    try {
      await redirectToBkash(invoiceId, "/student/payments/my-fees");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start payment."));
      setPaying(false);
    }
  }

  return (
    <DashboardPanel title="Admission fee due">
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Your application is approved. Pay the admission fee to confirm
          admission and receive your Student ID.
        </p>
        <p className="text-sm">
          Admission fee:{" "}
          <strong className="text-base tabular-nums">{formatBDT(due)}</strong>
          {invoiceNumber ? (
            <span className="ml-2 text-xs text-muted-foreground">
              Invoice {invoiceNumber}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={paying} onClick={handlePay}>
            {paying ? "Starting payment…" : `Pay ${formatBDT(due)} with bKash`}
          </Button>
          <Link
            href={`/student/invoices/${invoiceId}`}
            className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
          >
            View invoice
          </Link>
          <Link
            href="/student/admission-application"
            className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
          >
            Admission status
          </Link>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default function StudentInvoicesList({
  title = "My invoices",
}: {
  title?: string;
}) {
  const [filter, setFilter] = useState<TypeFilter>("ALL");
  const listQuery = useMyInvoices(
    filter === "ALL" ? undefined : { type: filter },
  );
  const summaryQuery = useMyInvoiceSummary();
  const admissionQuery = useMyAdmissionApplication();
  const invoices = listQuery.data ?? [];
  const summary = summaryQuery.data;
  const visible = invoices.filter((i) =>
    filter === "ALL" ? true : i.type === filter,
  );
  const active = visible.filter((i) => i.status !== "CANCELLED");
  const cancelled = visible.filter((i) => i.status === "CANCELLED");

  const chips: TypeFilter[] = ["ALL", "APPLICATION", "ADMISSION", "SEMESTER"];

  // The list can be empty while an admission invoice is still outstanding —
  // never answer that with "enroll in a section first".
  const mine = admissionQuery.data ?? null;
  const admissionInvoice =
    mine?.application?.status === "APPROVED" && !mine.admissionConfirmed
      ? (mine.admissionInvoice ?? null)
      : null;
  const overdue = summary?.overdueInstallments ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={title}
        subtitle={
          summary
            ? `${summary.invoiceCount} invoice(s) · ${formatBDT(summary.outstandingBalance)} outstanding`
            : "Invoices with installment schedule — pay with bKash."
        }
      />

      {summaryQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Total fees</p>
            <p className="mt-0.5 font-bold tabular-nums">
              {formatBDT(summary.totalFees)}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Paid</p>
            <p className="mt-0.5 font-bold tabular-nums text-success">
              {formatBDT(summary.totalPaid)}
            </p>
          </div>
          <div className="rounded-2xl border bg-destructive/30 bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Outstanding</p>
            <p className="mt-0.5 font-bold tabular-nums text-destructive">
              {formatBDT(summary.outstandingBalance)}
            </p>
          </div>
        </div>
      ) : null}

      {overdue.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">
            You have {overdue.length} overdue installment(s)
          </p>
          <ul className="flex flex-col gap-1 text-[13px]">
            {overdue.map((o) => (
              <li
                key={o.installmentId}
                className="flex items-center justify-between gap-2"
              >
                <span>
                  {o.invoiceNumber ?? "Invoice"} · installment {o.number} · due{" "}
                  {formatDueDate(o.dueDate)}
                </span>
                <Link
                  href={`/student/invoices/${o.invoiceId}`}
                  className="font-semibold underline"
                >
                  {formatBDT(o.remaining)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Overdue dues may block results, transcripts and your ID card until
            they are paid.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`h-8 rounded-full border px-3 text-[13px] font-semibold ${filter === c ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {listQuery.isLoading ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {[0, 1].map((i) => (
            <li key={i} className="rounded-2xl border bg-card p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-16 w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
            </li>
          ))}
        </ul>
      ) : listQuery.isError ? (
        <DashboardPanel title="Could not load invoices">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(listQuery.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="mt-3 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </DashboardPanel>
      ) : admissionInvoice ? (
        <AdmissionFeePrompt
          invoiceId={admissionInvoice.id}
          invoiceNumber={admissionInvoice.invoiceNumber}
          due={admissionInvoice.outstandingBalance}
        />
      ) : visible.length === 0 ? (
        <DashboardPanel title="No invoices yet">
          <p className="text-sm text-muted-foreground">
            {mine?.application?.status === "APPROVED"
              ? "Your application is approved but no admission invoice is available yet. If you expected an invoice, contact the accounts office."
              : mine?.application?.status === "SUBMITTED"
                ? "Your application is still under review. The admission invoice is created once an administrator approves it."
                : "Enroll in a section first, then generate your semester invoice."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mine?.application?.status === "APPROVED" ? (
              <>
                <Link
                  href="/student/admission-application"
                  className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
                >
                  Admission status
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void listQuery.refetch();
                    void admissionQuery.refetch();
                  }}
                  className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
                >
                  Refresh
                </button>
              </>
            ) : (
              <Link
                href="/student/enrollments"
                className="inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Browse sections
              </Link>
            )}
          </div>
        </DashboardPanel>
      ) : (
        <>
          <ul className="grid items-start gap-3 md:grid-cols-2">
            {active.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </ul>
          {cancelled.length > 0 ? (
            <details className="rounded-2xl border p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Cancelled ({cancelled.length})
              </summary>
              <ul className="mt-3 grid items-start gap-3 md:grid-cols-2">
                {cancelled.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
