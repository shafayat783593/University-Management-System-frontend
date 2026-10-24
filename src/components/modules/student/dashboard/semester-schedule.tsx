"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { StudentFee } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDownloadReceipt, useInitBkashPayment } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { formatBDT, formatDueDate } from "./admission-fee-card";

/**
 * Semester Payment Schedule.
 * Renders the TUITION fee's installments[] from GET /payments/my-fees —
 * number/amount/dueDate/status/isOverdue are all backend-derived.
 * Only the first unpaid installment is payable (backend enforces order).
 */
export default function SemesterSchedule({ fee }: { fee: StudentFee | null }) {
  const payNow = useInitBkashPayment();
  const receipt = useDownloadReceipt();

  if (!fee) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed bg-card p-5">
        <p className="text-sm font-bold">Semester Payment Schedule</p>
        <p className="text-[13px] text-muted-foreground">
          No semester invoice yet — register for courses first, then your
          installment plan appears here.
        </p>
        <Link
          href="/student/enrollments"
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Go to semester registration →
        </Link>
      </div>
    );
  }

  const total = fee.installments.length;
  const firstUnpaid = fee.installments.find((i) => i.status !== "PAID");

  function handlePay(id: string) {
    payNow.mutate(id, {
      onSuccess: (data) => {
        window.location.href = data.bkashURL;
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not start payment.")),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">Semester Payment Schedule</p>
          <p className="text-xs text-muted-foreground">
            {fee.semester?.name ?? "Tuition"} · {total} installment
            {total > 1 ? "s" : ""} · Total {formatBDT(fee.amount)}
          </p>
        </div>
        <Badge variant={fee.status === "PAID" ? "success" : "warning"}>
          {fee.status.replace("_", " ")}
        </Badge>
      </div>

      <ol className="flex flex-col gap-2">
        {fee.installments.map((inst) => {
          const paid = inst.status === "PAID";
          const payable = firstUnpaid?.id === inst.id;
          return (
            <li
              key={inst.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {inst.number}
                </span>
                <div>
                  <p className="text-sm font-bold tabular-nums">
                    {formatBDT(inst.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDueDate(inst.dueDate)}
                  </p>
                  {paid && inst.payment?.trxId ? (
                    <p className="text-[11px] text-muted-foreground">
                      Trx: {inst.payment.trxId}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {inst.isOverdue && !paid ? (
                  <Badge variant="destructive">Overdue</Badge>
                ) : null}
                <Badge
                  variant={paid ? "success" : payable ? "warning" : "secondary"}
                >
                  {paid ? "Paid" : payable ? "Due" : "Upcoming"}
                </Badge>
                {!paid && payable ? (
                  <Button
                    size="sm"
                    onClick={() => handlePay(inst.id)}
                    disabled={payNow.isPending}
                  >
                    {payNow.isPending && payNow.variables === inst.id
                      ? "Opening…"
                      : "Pay"}
                  </Button>
                ) : null}
                {paid && inst.payment?.id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={receipt.isPending}
                    onClick={() => {
                      const paymentId = inst.payment?.id;
                      if (!paymentId) return;
                      receipt.mutate(
                        {
                          paymentId,
                          filename: `receipt-${fee.invoiceNo ?? fee.id}-${inst.number}.pdf`,
                        },
                        {
                          onSuccess: () => toast.success("Receipt downloaded."),
                          onError: (err) =>
                            toast.error(
                              getApiErrorMessage(
                                err,
                                "Receipt download failed.",
                              ),
                            ),
                        },
                      );
                    }}
                  >
                    <Download className="size-3.5" />
                    Receipt
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        href="/student/payments/my-fees"
        className="text-[13px] font-semibold text-primary hover:underline"
      >
        View payment history →
      </Link>
    </div>
  );
}
