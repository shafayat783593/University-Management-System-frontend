"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInitPayment, useInvoiceDetail } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatBDT, formatDueDate } from "@/lib/format";

const TYPE_LABEL: Record<string, string> = {
  APPLICATION: "Application",
  ADMISSION: "Admission",
  SEMESTER: "Semester",
};

// §11 — one invoice: installment schedule + a single Pay button.
// Only the first unpaid installment is payable (server rejects the rest).
export default function StudentInvoiceDetail({ id }: { id: string }) {
  const query = useInvoiceDetail(id);
  const pay = useInitPayment();
  const [amount, setAmount] = useState("");
  const invoice = query.data;

  function handlePay() {
    if (!invoice) return;
    const nextInst =
      invoice.installments
        .slice()
        .sort((a, b) => a.number - b.number)
        .find((i) => i.status !== "PAID") ?? null;
    if (!nextInst) return;
    const payload: { invoiceId: string; amount?: number } = {
      invoiceId: invoice.id,
    };
    if (invoice.allowPartialPayment && amount.trim()) {
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0 || n > nextInst.remaining) {
        toast.error(
          `Enter an amount between 1 and ${formatBDT(nextInst.remaining)}.`,
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
        sessionStorage.setItem(
          "payReturnTo",
          `/student/invoices/${invoice.id}`,
        );
        window.location.href = data.bkashURL;
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not start payment.")),
    });
  }

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !invoice) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load invoice</p>
        <p className="text-[13px] text-muted-foreground">
          {getApiErrorMessage(query.error, "Check the link and try again.")}
        </p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => query.refetch()}
            className="h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
          <Link
            href="/student/invoices"
            className="inline-flex h-8 items-center rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            All invoices
          </Link>
        </div>
      </div>
    );
  }

  const next =
    invoice.installments
      .slice()
      .sort((a, b) => a.number - b.number)
      .find((i) => i.status !== "PAID") ?? null;
  const cancelled = invoice.status === "CANCELLED";

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={`${TYPE_LABEL[invoice.type] ?? invoice.type} invoice`}
        subtitle={invoice.invoiceNumber ?? "Invoice details"}
        action={
          <Link
            href="/student/invoices"
            className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
          >
            All invoices
          </Link>
        }
      />

      <DashboardPanel
        title="Balance"
        action={
          <Badge variant={invoice.status === "PAID" ? "success" : "warning"}>
            {invoice.status.replace("_", " ")}
          </Badge>
        }
      >
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Payable
            </dt>
            <dd className="mt-0.5 text-base font-bold tabular-nums">
              {formatBDT(invoice.payableAmount)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Paid
            </dt>
            <dd className="mt-0.5 text-base font-bold tabular-nums text-success">
              {formatBDT(invoice.paidAmount)}
            </dd>
          </div>
          <div className="rounded-xl bg-destructive/[0.07] p-3">
            <dt className="text-[11px] font-medium text-muted-foreground">
              Due
            </dt>
            <dd className="mt-0.5 text-base font-bold tabular-nums text-destructive">
              {formatBDT(invoice.outstandingBalance)}
            </dd>
          </div>
        </dl>

        {invoice.items.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-[13px]">
            {invoice.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-muted-foreground">
                  {item.description} × {item.quantity}
                  {item.isRefundable ? (
                    <span className="ml-1 text-[11px] text-success">
                      (Refundable)
                    </span>
                  ) : null}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatBDT(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {invoice.transactions?.length > 0 ? (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Transactions
            </summary>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatBDT(t.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "SUCCESS"
                            ? "success"
                            : t.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.receiptNumber ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </details>
        ) : null}

        {cancelled ? (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-[13px] font-semibold text-destructive">
            This invoice was cancelled — it can no longer be paid.
          </p>
        ) : next ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {invoice.allowPartialPayment ? (
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Amount (max ${next.remaining})`}
                type="number"
                min={1}
                step="0.01"
                aria-label={`Payment amount, up to ${next.remaining}`}
                className="h-11 w-48"
              />
            ) : null}
            <Button
              onClick={handlePay}
              disabled={pay.isPending}
              className="h-11 sm:w-fit sm:px-8"
            >
              {pay.isPending
                ? "Opening bKash…"
                : `Pay ${formatBDT(next.remaining)} with bKash`}
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-[13px] font-semibold text-success">
            Fully paid — nothing due.
          </p>
        )}
      </DashboardPanel>

      {invoice.installments.length > 0 ? (
        <DashboardPanel title="Installment schedule">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.installments
                .slice()
                .sort((a, b) => a.number - b.number)
                .map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-semibold">
                      Installment {i.number}
                    </TableCell>
                    <TableCell>{formatDueDate(i.dueDate)}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatBDT(i.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.status === "PAID"
                            ? "success"
                            : i.isOverdue
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {i.isOverdue && i.status !== "PAID"
                          ? "Overdue"
                          : i.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
