"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table.pagination";
import { formatBDT, formatDueDate } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiClient";
import { useDownloadTransactionReceipt, useMyTransactions, useVerifyPayment } from "@/hooks";
import type { PaymentTransaction } from "@/api";

const PAGE_SIZE = 10;

function statusVariant(status: string) {
  if (status === "SUCCESS") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REFUNDED") return "secondary" as const;
  return "destructive" as const;
}

function ReceiptButton({ tx }: { tx: PaymentTransaction }) {
  const download = useDownloadTransactionReceipt();
  const verify = useVerifyPayment();
  if (tx.status === "INITIATED" || tx.status === "PENDING") {
    return (
      <button
        type="button"
        disabled={verify.isPending}
        onClick={() =>
          verify.mutate(tx.id, {
            onSuccess: () => toast.success("Payment status updated."),
            onError: (err) => toast.error(getApiErrorMessage(err, "Re-check failed.")),
          })
        }
        className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted disabled:opacity-50"
      >
        {verify.isPending ? "…" : "Re-check"}
      </button>
    );
  }
  if (tx.status !== "SUCCESS" && tx.status !== "REFUNDED") return <span>—</span>;
  return (
    <button
      type="button"
      disabled={download.isPending}
      onClick={() =>
        download.mutate(
          { id: tx.id, filename: `receipt-${tx.receiptNumber}.pdf` },
          { onError: (err) => toast.error(getApiErrorMessage(err, "Download failed.")) },
        )
      }
      className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted disabled:opacity-50"
    >
      {download.isPending ? "…" : "Receipt"}
    </button>
  );
}

export default function StudentPaymentsHistory() {
  const [page, setPage] = useState(1);
  const query = useMyTransactions({ page, limit: PAGE_SIZE });
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Payments"
        subtitle={
          meta
            ? `${meta.total} transaction(s) • page ${meta.page} of ${meta.totalPages}`
            : "Every bKash attempt, newest first."
        }
      />

      <DashboardPanel title="History">
        {query.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load payments.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {getApiErrorMessage(query.error, "Try again in a moment.")}
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payments yet — pay an invoice to see it here.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-[13px]">{formatDueDate(tx.initiatedAt)}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {tx.invoice.invoiceNumber ?? tx.invoiceId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatBDT(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[13px]">{tx.receiptNumber}</TableCell>
                    <TableCell>
                      <ReceiptButton tx={tx} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-center">
              <TablePagination
                page={meta?.page ?? page}
                totalPages={meta?.totalPages ?? 1}
                handlePageChange={setPage}
              />
            </div>
          </>
        )}
      </DashboardPanel>
    </div>
  );
}
