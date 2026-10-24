"use client";

import Link from "next/link";
import { toast } from "sonner";
import type { StudentFee } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInitBkashPayment } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

import { formatBDT, formatDueDate } from "@/lib/format";

export { formatBDT, formatDueDate };

/**
 * Admission Fee invoice card.
 * Backend shape: the ADMISSION fee inside GET /payments/my-fees
 * (exactly one installment, non-refundable). Amount/deadline/status
 * all come from the backend — no hard-coded totals here.
 */
export default function AdmissionFeeCard({ fee }: { fee: StudentFee | null }) {
  const payNow = useInitBkashPayment();

  if (!fee) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed bg-card p-5">
        <p className="text-sm font-bold">Admission Fee Invoice</p>
        <p className="text-[13px] text-muted-foreground">
          No admission invoice yet — it is generated after your application is
          approved.
        </p>
        <Link
          href="/student/admission-application"
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Check application status →
        </Link>
      </div>
    );
  }

  const outstanding = fee.amount - fee.paidAmount;
  const firstUnpaid = fee.installments.find((i) => i.status !== "PAID");
  const paid = fee.status === "PAID";

  function handlePay() {
    if (!firstUnpaid) return;
    payNow.mutate(firstUnpaid.id, {
      onSuccess: (data) => {
        window.location.href = data.bkashURL;
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not start payment.")),
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold">Admission Fee Invoice</p>
          {fee.invoiceNo ? (
            <p className="text-xs text-muted-foreground">
              Invoice {fee.invoiceNo}
            </p>
          ) : null}
        </div>
        <Badge variant={paid ? "success" : "warning"}>
          {paid ? "Paid" : fee.status.replace("_", " ")}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-[11px] font-medium text-muted-foreground">
            Total Charges
          </dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums">
            {formatBDT(fee.amount)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-[11px] font-medium text-muted-foreground">
            Paid
          </dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-success">
            {formatBDT(fee.paidAmount)}
          </dd>
        </div>
        <div className="rounded-xl bg-destructive/[0.07] p-3">
          <dt className="text-[11px] font-medium text-muted-foreground">
            Outstanding
          </dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-destructive">
            {formatBDT(outstanding)}
          </dd>
        </div>
      </dl>

      {fee.items && fee.items.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
          {fee.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums">
                {formatBDT(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {firstUnpaid ? (
        <>
          <p className="text-[13px] text-muted-foreground">
            Payment deadline:{" "}
            <strong className="text-foreground">
              {formatDueDate(firstUnpaid.dueDate)}
            </strong>
            {firstUnpaid.isOverdue ? (
              <span className="font-semibold text-destructive"> · overdue</span>
            ) : null}
          </p>
          <Button
            onClick={handlePay}
            disabled={payNow.isPending}
            className="h-11 w-full sm:w-fit sm:px-8"
          >
            {payNow.isPending
              ? "Opening bKash…"
              : `Pay ${formatBDT(firstUnpaid.amount)} with bKash`}
          </Button>
        </>
      ) : (
        <p className="text-[13px] font-semibold text-success">
          Admission confirmed — fully paid.
        </p>
      )}
    </div>
  );
}
