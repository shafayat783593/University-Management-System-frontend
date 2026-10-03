"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Course } from "@/components/types";
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
import { useCourses, useDeleteCourse } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import CourseModal from "./course-modal";

export default function CoursesManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const courses = useCourses();
  const remove = useDeleteCourse();

  const rows = courses.data ?? [];

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Course) {
    setEditing(row);
    setModalOpen(true);
  }

  function confirmDelete(row: Course) {
    const ok = window.confirm(`Delete ${row.code}? This cannot be undone.`);
    if (!ok) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success("Course deleted."),
      onError: (err) => toast.error(getApiErrorMessage(err, "Delete failed.")),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Courses"
        subtitle="Create courses, set credit hours and prerequisites."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New course
          </Button>
        }
      />

      <DashboardPanel title="All courses" subtitle={`${rows.length} total`}>
        {courses.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : courses.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load courses.</p>
            <button
              type="button"
              onClick={() => courses.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No courses yet. Create the first one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Prerequisites</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-bold text-primary">
                    {row.code}
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.creditHours}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {row.prerequisites?.length ? (
                        row.prerequisites.map((p) => (
                          <Badge key={p.id} variant="secondary">
                            {p.code}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
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
        )}
      </DashboardPanel>

      <CourseModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
