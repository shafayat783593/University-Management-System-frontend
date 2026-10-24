"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useAddInvoiceAdjustment,
  useAllInvoices,
  useApplyLateFees,
  useCancelInvoice,
  useGenerateSemesterInvoices,
  useInvoiceDetail,
  useSemesters,
} from "@/hooks";
import useDebounce from "@/hooks/searchDebounce.hook";
import type { Invoice } from "@/api";

const PAGE_SIZE = 10;
const inputClass = "h-9 rounded-xl border bg-background px-3 text-sm";

function statusVariant(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIALLY_PAID") return "warning" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
}

// Bulk generate for a semester (or one student) + manual late-fee run.
// §12: there is no cron — late fees only run when someone presses the button.
function BulkBar() {
  const [semesterId, setSemesterId] = useState("");
  const [studentId, setStudentId] = useState("");
  const semesters = useSemesters().data?.items ?? [];
  const generate = useGenerateSemesterInvoices();
  const lateFees = useApplyLateFees();

  function handleGenerate() {
    if (!semesterId) return toast.error("Pick a semester.");
    generate.mutate(
      { semesterId, studentId: studentId.trim() || undefined },
      {
        onSuccess: (r) => toast.success(`Created ${r.created.length}, skipped ${r.skipped.length}.`),
        onError: (err) => toast.error(getApiErrorMessage(err, "Generation failed.")),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end sm:gap-3 sm:p-5">
      <label className="grid flex-1 gap-1 text-[13px] font-semibold">
        Semester
        <Select value={semesterId} onValueChange={(v) => setSemesterId(v ?? "")}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select a semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="grid flex-1 gap-1 text-[13px] font-semibold">
        One student only (UUID, optional)
        <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="blank = whole semester" className="h-9" />
      </label>
      <Button type="button" disabled={generate.isPending} onClick={handleGenerate} className="h-9">
        {generate.isPending ? "Generating…" : "Generate"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={lateFees.isPending}
        onClick={() =>
          lateFees.mutate(undefined, {
            onSuccess: (r) => toast.success(`Late fees: ${r.appliedCount} invoice(s), ${formatBDT(r.totalLateFees)}.`),
            onError: (err) => toast.error(getApiErrorMessage(err, "Late-fee run failed.")),
          })
        }
        className="h-9"
      >
        {lateFees.isPending ? "Running…" : "Apply late fees"}
      </Button>
    </div>
  );
}

// Selected invoice: schedule + adjustment + cancel. Adjustments only work
// before anything is paid; waivers need a 5+ char reason.
function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const detailQuery = useInvoiceDetail(invoice.id);
  const adjust = useAddInvoiceAdjustment();
  const cancel = useCancelInvoice();
  const [adjType, setAdjType] = useState<"WAIVER" | "SCHOLARSHIP" | "DISCOUNT" | "ADJUSTMENT">("WAIVER");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const detail = detailQuery.data;

  function handleAdjust() {
    const amount = Number(adjAmount);
    if (!Number.isFinite(amount) || amount === 0) return toast.error("Enter a non-zero amount.");
    if (adjReason.trim().length < 5) return toast.error("Reason needs at least 5 characters.");
    adjust.mutate(
      { id: invoice.id, payload: { type: adjType, amount, reason: adjReason.trim() } },
      {
        onSuccess: () => {
          toast.success("Adjustment applied.");
          setAdjAmount("");
          setAdjReason("");
          void detailQuery.refetch();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Adjustment failed.")),
      },
    );
  }

  function handleCancel() {
    if (cancelReason.trim().length < 5) return toast.error("Reason needs at least 5 characters.");
    if (!window.confirm(`Cancel invoice ${invoice.invoiceNumber ?? invoice.id}?`)) return;
    cancel.mutate(
      { id: invoice.id, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          toast.success("Invoice cancelled.");
          setCancelReason("");
          void detailQuery.refetch();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Cancel failed.")),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {detailQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : detailQuery.isError || !detail ? (
        <p className="text-sm text-muted-foreground">Could not load detail.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.installments.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-semibold">{i.number}</TableCell>
                  <TableCell>{formatDueDate(i.dueDate)}</TableCell>
                  <TableCell className="tabular-nums">{formatBDT(i.amount)}</TableCell>
                  <TableCell className="tabular-nums">{formatBDT(i.paidAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={i.status === "PAID" ? "success" : "secondary"}>{i.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-4">
            <label className="grid gap-1 text-[13px] font-semibold">
              Type
              <select value={adjType} onChange={(e) => setAdjType(e.target.value as typeof adjType)} className={inputClass}>
                <option value="WAIVER">WAIVER (−)</option>
                <option value="SCHOLARSHIP">SCHOLARSHIP (−)</option>
                <option value="DISCOUNT">DISCOUNT (−)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (±)</option>
              </select>
            </label>
            <label className="grid gap-1 text-[13px] font-semibold">
              Amount ৳
              <Input type="number" step="0.01" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} className="h-9" />
            </label>
            <label className="grid gap-1 text-[13px] font-semibold sm:col-span-2">
              Reason (min 5 chars)
              <div className="flex gap-2">
                <Input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="h-9 flex-1" />
                <Button type="button" size="sm" disabled={adjust.isPending} onClick={handleAdjust}>
                  Apply
                </Button>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="grid flex-1 gap-1 text-[13px] font-semibold">
              Cancel reason (min 5 chars)
              <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="h-9" />
            </label>
            <Button type="button" variant="destructive" disabled={cancel.isPending} onClick={handleCancel} className="h-9">
              Cancel invoice
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminInvoicesManager() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchTerm = useDebounce(searchInput, 500);

  const listQuery = useAllInvoices({
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
    type: type || undefined,
    searchTerm: searchTerm || undefined,
  });
  const rows = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  function resetPage() {
    setPage(1);
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Invoices"
        subtitle={
          meta ? `${meta.total} total • page ${meta.page} of ${meta.totalPages}` : "Filter, adjust, cancel, bulk-generate."
        }
      />

      <BulkBar />

      <DashboardPanel title="All invoices">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              resetPage();
            }}
            placeholder="Invoice no, name, email, student ID…"
            className="h-9 w-full sm:w-64"
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className={inputClass}>
            <option value="">All statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); resetPage(); }} className={inputClass}>
            <option value="">All types</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="ADMISSION">ADMISSION</option>
            <option value="SEMESTER">SEMESTER</option>
          </select>
        </div>

        {listQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : listQuery.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load invoices.</p>
            <button type="button" onClick={() => listQuery.refetch()} className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No invoices match these filters.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payable</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-[13px]">{r.invoiceNumber ?? r.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-[13px]">{r.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatBDT(r.payableAmount)}</TableCell>
                    <TableCell className="tabular-nums text-success">{formatBDT(r.paidAmount)}</TableCell>
                    <TableCell className="font-semibold tabular-nums text-destructive">{formatBDT(r.outstandingBalance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-center">
              <TablePagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} handlePageChange={setPage} />
            </div>
          </>
        )}
      </DashboardPanel>

      {selected ? (
        <DashboardPanel
          title={`Invoice ${selected.invoiceNumber ?? ""}`}
          subtitle="Schedule, adjustment, cancel."
          action={
            <button type="button" onClick={() => setSelectedId(null)} className="h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted">
              Close
            </button>
          }
        >
          <InvoiceDetail invoice={selected} />
        </DashboardPanel>
      ) : null}
    </div>
  );
}
