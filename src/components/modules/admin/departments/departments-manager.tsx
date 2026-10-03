"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Department } from "@/components/types";
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
import { useDeleteDepartment, useDepartments } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import DepartmentModal from "./department-modal";

export default function DepartmentsManager() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const list = useDepartments(page);
  const remove = useDeleteDepartment();

  const rows = list.data?.items ?? [];
  const meta = list.data?.meta;

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Department) {
    setEditing(row);
    setModalOpen(true);
  }

  function confirmDelete(row: Department) {
    const ok = window.confirm(`Delete ${row.name}? This cannot be undone.`);
    if (!ok) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success("Department deleted."),
      onError: (err) => toast.error(getApiErrorMessage(err, "Delete failed.")),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Departments"
        subtitle="Create, rename, or remove departments."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New department
          </Button>
        }
      />

      <DashboardPanel
        title="All departments"
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
            <p className="font-semibold">Could not load departments.</p>
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
            No departments yet. Create the first one.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>{row.code}</TableCell>
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

      <DepartmentModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
