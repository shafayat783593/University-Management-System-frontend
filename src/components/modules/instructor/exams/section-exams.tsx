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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSectionExams } from "@/hooks";
import { useSectionEnrollments } from "@/hooks";
import { useCreateExam, useSubmitExamResults } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

// Create a new exam for this section.
function CreateExamCard({ sectionId }: { sectionId: string }) {
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState("MIDTERM");
  const [totalMarks, setTotalMarks] = useState("");

  const create = useCreateExam(sectionId);

  function handleCreate() {
    const total = Number(totalMarks);
    if (title.trim().length < 2) {
      toast.error("Title must be at least 2 characters.");
      return;
    }
    if (!total || total <= 0) {
      toast.error("Total marks must be a positive number.");
      return;
    }
    create.mutate(
      { title: title.trim(), examType, totalMarks: total },
      {
        onSuccess: () => {
          toast.success("Exam created. Now enter results below.");
          setTitle("");
          setTotalMarks("");
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Could not create exam.")),
      },
    );
  }

  return (
    <DashboardPanel title="New exam">
      <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1 text-sm font-medium">
          <label htmlFor="exam-title">Title</label>
          <Input
            id="exam-title"
            placeholder="e.g. Midterm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm font-medium">
          <label htmlFor="exam-type">Type</label>
          <select
            id="exam-type"
            className={inputClass}
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            <option value="QUIZ">QUIZ</option>
            <option value="MIDTERM">MIDTERM</option>
            <option value="FINAL">FINAL</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 text-sm font-medium">
          <label htmlFor="exam-total">Total marks</label>
          <Input
            id="exam-total"
            type="number"
            min={1}
            placeholder="e.g. 100"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="sm:w-32"
          />
        </div>
        <Button onClick={handleCreate} disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create exam"}
        </Button>
      </div>
    </DashboardPanel>
  );
}

// Marks entry table for one exam. Submitted as a single batch.
function ResultsEntry({
  sectionId,
  examId,
  examTitle,
  totalMarks,
}: {
  sectionId: string;
  examId: string;
  examTitle: string;
  totalMarks: number;
}) {
  const [marks, setMarks] = useState<Record<string, string>>({});

  const roster = useSectionEnrollments(sectionId);
  const submit = useSubmitExamResults();
  const students = roster.data ?? [];

  function handleSubmit() {
    const records: { studentId: string; marksObtained: number }[] = [];
    for (const s of students) {
      const raw = (marks[s.studentId] ?? "").trim();
      if (!raw) continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || value > totalMarks) {
        toast.error(
          `${s.student.user.name}: marks must be between 0 and ${totalMarks}.`,
        );
        return;
      }
      records.push({ studentId: s.studentId, marksObtained: value });
    }
    if (records.length === 0) {
      toast.error("Enter marks for at least one student.");
      return;
    }
    submit.mutate(
      { examId, records },
      {
        onSuccess: () => {
          toast.success("Results submitted as draft.");
          setMarks({});
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Submit failed.")),
      },
    );
  }

  if (roster.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No enrolled students in this section.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="w-40 text-right">
              Marks (/{totalMarks})
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s.studentId}>
              <TableCell>
                <span className="block text-sm font-semibold">
                  {s.student.user.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {s.student.studentIdCode ?? s.student.user.email}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={0}
                  max={totalMarks}
                  placeholder="—"
                  value={marks[s.studentId] ?? ""}
                  onChange={(e) =>
                    setMarks((m) => ({ ...m, [s.studentId]: e.target.value }))
                  }
                  className="ml-auto w-28 text-right"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Button onClick={handleSubmit} disabled={submit.isPending}>
          {submit.isPending ? "Submitting…" : `Submit results — ${examTitle}`}
        </Button>
      </div>
    </>
  );
}

// Task 19: create exams + submit results for a section.
export default function SectionExams({ sectionId }: { sectionId: string }) {
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const examsQuery = useSectionExams(sectionId);
  const exams = examsQuery.data ?? [];
  const activeExam = exams.find((e) => e.id === activeExamId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Exams & results"
        subtitle="Create an exam, then enter every student's marks in one go."
      />

      <CreateExamCard sectionId={sectionId} />

      <DashboardPanel
        title="Exams"
        subtitle="Pick an exam to enter results."
      >
        {examsQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : examsQuery.isError ? (
          <div className="py-6 text-center text-sm">
            <p className="font-semibold">Could not load exams.</p>
            <button
              type="button"
              onClick={() => examsQuery.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : exams.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No exams yet. Create one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${exam.id === activeExamId ? "border-primary" : ""}`}
              >
                <span className="text-sm font-semibold">
                  {exam.title}
                  <span className="ml-2">
                    <Badge variant="secondary">{exam.examType}</Badge>
                  </span>
                  <span className="ml-2 font-normal text-muted-foreground">
                    /{exam.totalMarks}
                  </span>
                </span>
                <Button
                  variant={exam.id === activeExamId ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setActiveExamId(exam.id === activeExamId ? null : exam.id)
                  }
                >
                  Enter results
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      {activeExam ? (
        <DashboardPanel
          title={`Results — ${activeExam.title}`}
          subtitle="Saved as DRAFT. An admin publishes them later."
        >
          <ResultsEntry
            sectionId={sectionId}
            examId={activeExam.id}
            examTitle={activeExam.title}
            totalMarks={activeExam.totalMarks}
          />
        </DashboardPanel>
      ) : null}
    </div>
  );
}
