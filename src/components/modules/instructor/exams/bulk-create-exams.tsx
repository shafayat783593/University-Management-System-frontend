"use client";

import { Plus, Trash2 } from "lucide-react";
import { FetchError } from "ofetch";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useBulkCreateExams, useInstructorSections } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const EXAM_TYPES = ["QUIZ", "MIDTERM", "FINAL"] as const;

interface ExamRow {
  key: number;
  sectionId: string;
  title: string;
  examType: string;
  totalMarks: string;
  examDate: string;
}

let nextKey = 1;
function newRow(): ExamRow {
  return {
    key: nextKey++,
    sectionId: "",
    title: "",
    examType: "MIDTERM",
    totalMarks: "",
    examDate: "",
  };
}

function setRow(
  rows: ExamRow[],
  key: number,
  patch: Partial<ExamRow>,
): ExamRow[] {
  return rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
}

// Task 26 — create exams across several own sections in one submit.
// The section picker only lists the instructor's OWN sections, so the
// backend's 403 ("not yours, whole batch rejected") shouldn't trigger —
// but if it does, show that message clearly instead of a generic error.
export default function BulkCreateExams() {
  const { data: me } = useAuth();
  const instructorId = me?.data?.instructorProfile?.id;

  const sectionsQuery = useInstructorSections(instructorId);
  const sections = sectionsQuery.data?.items ?? [];

  const [rows, setRows] = useState<ExamRow[]>([newRow()]);
  const bulk = useBulkCreateExams();

  function handleSubmit() {
    const exams: {
      sectionId: string;
      title: string;
      examType: string;
      totalMarks: number;
      examDate?: string;
    }[] = [];

    for (const [index, row] of rows.entries()) {
      const total = Number(row.totalMarks);
      if (!row.sectionId) {
        toast.error(`Row ${index + 1}: pick a section.`);
        return;
      }
      if (row.title.trim().length < 2) {
        toast.error(`Row ${index + 1}: title is too short.`);
        return;
      }
      if (!total || total <= 0) {
        toast.error(`Row ${index + 1}: total marks must be positive.`);
        return;
      }
      exams.push({
        sectionId: row.sectionId,
        title: row.title.trim(),
        examType: row.examType,
        totalMarks: total,
        examDate: row.examDate
          ? new Date(row.examDate).toISOString()
          : undefined,
      });
    }

    bulk.mutate(exams, {
      onSuccess: (created) => {
        toast.success(
          `${created.length} exam${created.length > 1 ? "s" : ""} created. Students were emailed automatically.`,
        );
        setRows([newRow()]);
      },
      onError: (err) => {
        // Whole batch rejected — most likely a section that isn't theirs.
        if (err instanceof FetchError && err.status === 403) {
          toast.error("Not your section", {
            description: getApiErrorMessage(
              err,
              "One of these sections doesn't belong to you — the whole batch was rejected.",
            ),
          });
          return;
        }
        toast.error(getApiErrorMessage(err, "Could not create exams."));
      },
    });
  }

  if (!instructorId) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Bulk create exams"
          subtitle="Create exams for several of your sections at once."
        />
        <p className="rounded-2xl border border-dashed px-6 py-14 text-center text-sm text-muted-foreground">
          No instructor profile found on your account.
        </p>
      </div>
    );
  }

  if (sectionsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (sectionsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Bulk create exams"
          subtitle="Create exams for several of your sections at once."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load your sections</p>
          <button
            type="button"
            onClick={() => sectionsQuery.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Bulk create exams"
        subtitle="One row per exam — add rows, then submit everything together."
      />

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={row.key}
            className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_130px_110px_190px_auto] lg:items-end"
          >
            <label className="grid gap-1 text-[13px] font-semibold">
              Section · Row {index + 1}
              <select
                value={row.sectionId}
                onChange={(e) =>
                  setRows(setRow(rows, row.key, { sectionId: e.target.value }))
                }
                className="h-9 rounded-xl border bg-background px-3 text-sm font-normal"
              >
                <option value="">Pick a section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course.code} · {s.semester.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-[13px] font-semibold">
              Title
              <Input
                placeholder="e.g. Midterm"
                value={row.title}
                onChange={(e) =>
                  setRows(setRow(rows, row.key, { title: e.target.value }))
                }
                className="h-9"
              />
            </label>

            <label className="grid gap-1 text-[13px] font-semibold">
              Type
              <select
                value={row.examType}
                onChange={(e) =>
                  setRows(setRow(rows, row.key, { examType: e.target.value }))
                }
                className="h-9 rounded-xl border bg-background px-3 text-sm font-normal"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-[13px] font-semibold">
              Marks
              <Input
                type="number"
                min={1}
                placeholder="100"
                value={row.totalMarks}
                onChange={(e) =>
                  setRows(setRow(rows, row.key, { totalMarks: e.target.value }))
                }
                className="h-9"
              />
            </label>

            <label className="grid gap-1 text-[13px] font-semibold">
              Date{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <Input
                type="datetime-local"
                value={row.examDate}
                onChange={(e) =>
                  setRows(setRow(rows, row.key, { examDate: e.target.value }))
                }
                className="h-9"
              />
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rows.length === 1}
              onClick={() => setRows(rows.filter((r) => r.key !== row.key))}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setRows([...rows, newRow()])}
        >
          <Plus className="size-4" />
          Add row
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={bulk.isPending || sections.length === 0}
        >
          {bulk.isPending
            ? "Creating…"
            : `Create ${rows.length} exam${rows.length > 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
