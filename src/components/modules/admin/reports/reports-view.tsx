"use client";

import { useState } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
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
  useCollectionReport,
  useOutstandingReport,
  useOverdueReport,
  useSemesters,
} from "@/hooks";

const inputClass = "h-9 rounded-xl border bg-background px-3 text-sm";

// §11 — money reports in one place: collection (bKash in/out),
// outstanding dues per student, and every overdue installment.
function PanelError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="py-8 text-center text-sm">
      <p className="font-semibold">Could not load.</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {getApiErrorMessage(error, "Try again in a moment.")}
      </p>
      <button type="button" onClick={onRetry} className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted">
        Retry
      </button>
    </div>
  );
}

function CollectionPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const semesters = useSemesters().data?.items ?? [];
  const query = useCollectionReport({
    from: from || undefined,
    to: to || undefined,
    semesterId: semesterId || undefined,
  });
  const report = query.data;

  return (
    <DashboardPanel title="Collection" subtitle="bKash money in vs money refunded.">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 sm:w-44" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 sm:w-44" />
        <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className={inputClass}>
          <option value="">All semesters</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : query.isError || !report ? (
        <PanelError error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[
              ["Collected", report.totals.collected, "text-success"],
              ["Refunded", report.totals.refunded, "text-muted-foreground"],
              ["Net", report.totals.net, "text-foreground"],
              ["Payments", String(report.totals.count), "text-foreground"],
            ].map(([label, value, cls]) => (
              <div key={label} className="rounded-xl bg-muted/60 p-3">
                <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
                <dd className={`mt-0.5 text-base font-bold tabular-nums ${cls}`}>
                  {label === "Payments" ? value : formatBDT(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
          {report.bySemester.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Refunded</TableHead>
                  <TableHead>Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.bySemester.map((r) => (
                  <TableRow key={r.semester}>
                    <TableCell className="font-semibold">{r.semester}</TableCell>
                    <TableCell className="tabular-nums text-success">{formatBDT(r.collected)}</TableCell>
                    <TableCell className="tabular-nums">{formatBDT(r.refunded)}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{formatBDT(r.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </>
      )}
    </DashboardPanel>
  );
}

function OutstandingPanel() {
  const [page, setPage] = useState(1);
  const query = useOutstandingReport({ page, limit: 10 });
  const rows = Array.isArray(query.data?.data) ? query.data?.data : [];
  console.log("OutstandingPanel rows:", rows);
  const meta = query.data?.meta;

  
  return (
    <DashboardPanel
      title="Outstanding dues"
      subtitle={meta ? `${formatBDT(meta.totalOutstanding ?? 0)} owed in total` : "Who still owes what."}
    >
      {query.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : query.isError ? (
        <PanelError error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nobody owes anything.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Owes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.studentId}>
                  <TableCell>
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="block text-xs text-muted-foreground">{r.email} · {r.studentIdCode}</span>
                  </TableCell>
                  <TableCell className="text-[13px]">{r.department}</TableCell>
                  <TableCell>{r.invoices}</TableCell>
                  <TableCell className="font-semibold tabular-nums text-destructive">{formatBDT(r.outstanding)}</TableCell>
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
  );
}

function OverduePanel() {
  const query = useOverdueReport();
  const rows = Array.isArray(query.data) ? query.data : [];

  return (
    <DashboardPanel title="Overdue installments" subtitle="Unpaid and past due, oldest first.">
      {query.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : query.isError ? (
        <PanelError error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing overdue.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.installmentId}>
                <TableCell className="font-mono text-[13px]">{r.invoiceNumber ?? r.invoiceId.slice(0, 8)}</TableCell>
                <TableCell>#{r.number}</TableCell>
                <TableCell>{formatDueDate(r.dueDate)}</TableCell>
                <TableCell className="font-semibold tabular-nums text-destructive">{formatBDT(r.remaining)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardPanel>
  );
}

export default function AdminReports() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Reports"
        subtitle="Collection, outstanding dues and overdue installments."
      />
      <CollectionPanel />
      <OutstandingPanel />
      <OverduePanel />
    </div>
  );
}
