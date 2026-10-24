"use client";

import { Receipt, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Payment, PaymentStatus } from "@/components/types";
import { Badge } from "@/components/ui/badge";
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
import TablePagination from "@/components/ui/table.pagination";
import { useAdminPayments } from "@/hooks";
import { useRefundPayment } from "@/hooks/payments.hook";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { useSemesters } from "@/hooks/enrollments.hook";
import useDebounce from "@/hooks/searchDebounce.hook";

const PAGE_SIZE = 10;
const inputClass = "h-9 rounded-xl border bg-background px-3 text-sm";

function statusVariant(status: PaymentStatus) {
  if (status === "PAID") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "REFUNDED") return "secondary" as const;
  return "destructive" as const;
}

function formatDay(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// §7 refund — PAID rows only. Amount blank = everything refundable.
// reverseCharge reopens the dues (student owes again); unticked just
// sends money back without reopening.
function RefundCell({ paymentId, status, amount }: { paymentId: string; status: PaymentStatus; amount: number }) {
  const [open, setOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reverseCharge, setReverseCharge] = useState(true);
  const refund = useRefundPayment();

  if (status !== "PAID") return <span>—</span>;

  function handleRefund() {
    const parsed = refundAmount.trim() === "" ? undefined : Number(refundAmount);
    if (parsed !== undefined && (!Number.isFinite(parsed) || parsed <= 0)) {
      return toast.error("Enter a positive amount, or leave blank for everything.");
    }
    if (reason.trim().length < 5) {
      return toast.error("Reason needs at least 5 characters.");
    }
    refund.mutate(
      { id: paymentId, payload: { amount: parsed, reason: reason.trim(), reverseCharge } },
      {
        onSuccess: (r) => {
          toast.success(r.reopenedDues ? "Refunded — dues reopened." : "Refunded.");
          setOpen(false);
          setRefundAmount("");
          setReason("");
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Refund failed.")),
      },
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
      >
        Refund
      </button>
    );
  }

  return (
    <div className="flex min-w-52 flex-col gap-1.5">
      <Input
        type="number"
        min={0}
        step="0.01"
        value={refundAmount}
        onChange={(e) => setRefundAmount(e.target.value)}
        placeholder={`Amount (blank = ৳${amount.toLocaleString()})`}
        className="h-8 text-[13px]"
      />
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (min 5 chars)"
        className="h-8 text-[13px]"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} />
        Reopen dues
      </label>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={refund.isPending}
          onClick={handleRefund}
          className="h-8 rounded-xl bg-destructive px-3 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {refund.isPending ? "…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function PaymentsManager() {  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [semesterId, setSemesterId] = useState("ALL");
  const [studentId, setStudentId] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const searchTerm = useDebounce(searchInput, 500);
  const debouncedStudentId = useDebounce(studentId.trim(), 500);

  const list = useAdminPayments({
    page,
    limit: PAGE_SIZE,
    status,
    semesterId: semesterId === "ALL" ? undefined : semesterId,
    studentId: debouncedStudentId || undefined,
    searchTerm: searchTerm || undefined,
  });

  const semesters = useSemesters().data?.items ?? [];
  const rows: Payment[] = list.data?.items ?? [];
  const meta = list.data?.meta;

  // Any filter change starts back from page 1.
  function resetPage() {
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Payments"
        subtitle={
          meta
            ? `${meta.total} total • page ${meta.page} of ${meta.totalPages}`
            : "All bKash payment attempts."
        }
      />

      <DashboardPanel title="All payments">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                resetPage();
              }}
              placeholder="Search name, email, trx ID…"
              className="pl-9"
            />
          </div>

          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PaymentStatus | "ALL");
              resetPage();
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>

          <select
            className={inputClass}
            value={semesterId}
            onChange={(e) => {
              setSemesterId(e.target.value);
              resetPage();
            }}
          >
            <option value="ALL">All semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Input
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              resetPage();
            }}
            placeholder="Student ID…"
            className="w-full sm:w-44"
          />
        </div>

        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load payments.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {getApiErrorMessage(list.error, "Try again in a moment.")}
            </p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
              <Receipt className="size-5" />
            </span>
            <p className="text-sm font-semibold">No payments found</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              No payments match these filters. Try a different status or search.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trx ID</TableHead>
                  <TableHead>Paid at</TableHead>
                  <TableHead>Refund</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const fee = row.installment?.fee;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <span className="block text-sm font-semibold">
                          {fee?.student?.user?.name ?? "—"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {[
                            fee?.student?.user?.email,
                            fee?.student?.studentIdCode,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {fee?.semester?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {row.installment?.number != null
                          ? `Installment ${row.installment.number}`
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        ৳{row.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {row.trxId ?? "—"}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {formatDay(row.paidAt)}
                      </TableCell>
                      <TableCell>
                        <RefundCell paymentId={row.id} status={row.status} amount={row.amount} />
                      </TableCell>
                    </TableRow>
                  );
                })}
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
