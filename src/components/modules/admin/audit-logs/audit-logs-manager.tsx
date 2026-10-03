"use client";

import { useState } from "react";
import { ScrollText, Search } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { AuditLog } from "@/components/types";
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
import { useAuditLogs } from "@/hooks";
import useDebounce from "@/hooks/searchDebounce.hook";

const PAGE_SIZE = 20;
const inputClass = "h-9 rounded-xl border bg-background px-3 text-sm";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogsManager() {
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const list = useAuditLogs({
    page,
    limit: PAGE_SIZE,
    actorId: useDebounce(actorId.trim(), 500) || undefined,
    action: useDebounce(action.trim(), 500) || undefined,
    targetType: useDebounce(targetType.trim(), 500) || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const rows: AuditLog[] = list.data?.items ?? [];
  const meta = list.data?.meta;

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Audit logs"
        subtitle={
          meta
            ? `${meta.total} total • page ${meta.page} of ${meta.totalPages}`
            : "Who changed what, and when."
        }
      />

      <DashboardPanel title="All events">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input
            value={actorId}
            onChange={(e) => {
              setActorId(e.target.value);
              resetPage();
            }}
            placeholder="Actor ID…"
            className="w-full sm:w-44"
          />
          <Input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              resetPage();
            }}
            placeholder="Action, e.g. RESULT_OVERRIDE…"
            className="w-full sm:w-56"
          />
          <Input
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              resetPage();
            }}
            placeholder="Target type, e.g. Result…"
            className="w-full sm:w-44"
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                resetPage();
              }}
              className="w-auto"
            />
            <span className="text-sm text-muted-foreground">→</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                resetPage();
              }}
              className="w-auto"
            />
          </div>
        </div>

        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load audit logs.</p>
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
              <ScrollText className="size-5" />
            </span>
            <p className="text-sm font-semibold">No audit events found</p>
            <p className="flex max-w-sm items-center gap-1 text-[13px] text-muted-foreground">
              <Search className="size-3.5" />
              Try widening the date range or clearing a filter.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="block text-sm font-semibold">
                        {row.actor?.name ?? "Unknown user"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {row.actor?.email ?? row.actorId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.action}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {row.targetType}
                      <span
                        className="block max-w-32 truncate text-xs text-muted-foreground"
                        title={row.targetId}
                      >
                        {row.targetId}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-[13px] text-muted-foreground">
                      {row.reason ?? "—"}
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
