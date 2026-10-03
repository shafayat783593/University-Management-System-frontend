"use client";

import { CalendarDays, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Semester } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSemesters } from "@/hooks/enrollments.hook";
import TablePagination from "@/components/ui/table.pagination";
import SemesterDatesModal from "./semester-dates-modal";
import SemesterModal from "./semester-modal";
import SemesterStatusModal from "./semester-status-modal";

// Short date like "12 Jan 2026". Empty when no date is set yet.
function formatDay(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SemestersManager() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);

  const list = useSemesters(page);
  const rows = list.data?.items ?? [];
  const meta = list.data?.meta;

  function openStatus(row: Semester) {
    setEditing(row);
    setStatusOpen(true);
  }

  function openDates(row: Semester) {
    setEditing(row);
    setDatesOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Semesters"
        subtitle="Create semesters and move them UPCOMING → OPEN → CLOSED."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New semester
          </Button>
        }
      />

      <DashboardPanel
        title="All semesters"
        subtitle={meta ? `${meta.total} total` : undefined}
      >
        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load semesters.</p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No semesters yet. Create the first one.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Calendar dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.term}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "OPEN"
                            ? "success"
                            : row.status === "UPCOMING"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.enrollmentStart || row.enrollmentEnd ? (
                        <span className="text-sm">
                          {formatDay(row.enrollmentStart)}
                          {row.enrollmentStart && row.enrollmentEnd
                            ? " → "
                            : ""}
                          {formatDay(row.enrollmentEnd)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit calendar dates"
                        onClick={() => openDates(row)}
                      >
                        <CalendarDays className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Change status"
                        onClick={() => openStatus(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
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

      <SemesterModal
        key="new"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <SemesterStatusModal
        key={editing?.id ?? "status"}
        open={statusOpen}
        semester={editing}
        onClose={() => setStatusOpen(false)}
      />
      <SemesterDatesModal
        key={editing?.id ?? "dates"}
        open={datesOpen}
        semester={editing}
        onClose={() => setDatesOpen(false)}
      />
    </div>
  );
}
