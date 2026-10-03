"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Section } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table.pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminSections, useDeleteSection } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import SectionModal from "./section-modal";

export default function SectionsManager() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);

  const list = useAdminSections(page);
  const remove = useDeleteSection();

  const rows = list.data?.items ?? [];
  const meta = list.data?.meta;

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Section) {
    setEditing(row);
    setModalOpen(true);
  }

  function confirmDelete(row: Section) {
    const ok = window.confirm(
      `Delete ${row.course.code}? This cannot be undone.`,
    );
    if (!ok) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success("Section deleted."),
      onError: (err) => toast.error(getApiErrorMessage(err, "Delete failed.")),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Sections"
        subtitle="Open class sections: course + semester + instructor."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New section
          </Button>
        }
      />

      <DashboardPanel
        title="All sections"
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
            <p className="font-semibold">Could not load sections.</p>
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
            No sections yet. Create the first one.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">
                      {row.course.code}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {row.course.title}
                      </span>
                    </TableCell>
                    <TableCell>{row.semester.name}</TableCell>
                    <TableCell>{row.instructor?.user?.name ?? "—"}</TableCell>
                    <TableCell>
                      {row.enrolledCount}/{row.capacity}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(row)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
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

      <SectionModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
