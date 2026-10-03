"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllSections } from "@/api";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useOverrideResult,
  usePublishExamResults,
  useSectionExams,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

// Pick a section → pick an exam → publish its draft results.
function PublishCard() {
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");

  const sections = useQuery({
    queryKey: ["sections", "all"],
    queryFn: () => getAllSections({ limit: 50 }),
  }).data?.items ?? [];

  const exams = useSectionExams(sectionId).data ?? [];
  const exam = exams.find((e) => e.id === examId);

  const publish = usePublishExamResults();

  function handlePublish() {
    if (!exam) return;
    const ok = window.confirm(
      `Publish all draft results for "${exam.title}"? Students will see their marks.`,
    );
    if (!ok) return;
    publish.mutate(exam.id, {
      onSuccess: () => toast.success("Results published."),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Publish failed.")),
    });
  }

  return (
    <DashboardPanel
      title="Publish exam results"
      subtitle="PATCH /results/exams/:examId/publish — moves every DRAFT result to PUBLISHED."
    >
      <div className="flex max-w-md flex-col gap-3">
        <div className="flex flex-col gap-1 text-sm font-medium">
          <label htmlFor="pub-section">Section</label>
          <select
            id="pub-section"
            className={inputClass}
            value={sectionId}
            onChange={(e) => {
              setSectionId(e.target.value);
              setExamId("");
            }}
          >
            <option value="">Select a section…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course.code} · {s.semester.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 text-sm font-medium">
          <label htmlFor="pub-exam">Exam</label>
          <select
            id="pub-exam"
            className={inputClass}
            value={examId}
            disabled={!sectionId}
            onChange={(e) => setExamId(e.target.value)}
          >
            <option value="">Select an exam…</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.examType}, /{e.totalMarks})
              </option>
            ))}
          </select>
        </div>

        {exam ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{exam.examType}</Badge>
            {exam.title} — total marks {exam.totalMarks}
          </p>
        ) : null}

        <Button
          onClick={handlePublish}
          disabled={!exam || publish.isPending}
        >
          {publish.isPending ? "Publishing…" : "Publish results"}
        </Button>
      </div>
    </DashboardPanel>
  );
}

// Change one published result. Reason is required (backend: min 3 chars).
function OverrideCard() {
  const override = useOverrideResult();

  const form = useForm({
    defaultValues: { resultId: "", marksObtained: "", reason: "" },
    onSubmit: ({ value }) => {
      const marks = Number(value.marksObtained);
      if (!value.resultId.trim()) {
        return toast.error("Please enter a result ID.");
      }
      if (!Number.isFinite(marks) || marks < 0) {
        return toast.error("Marks must be 0 or more.");
      }
      if (value.reason.trim().length < 3) {
        return toast.error("A reason is required (at least 3 characters).");
      }
      override.mutate(
        {
          resultId: value.resultId.trim(),
          marksObtained: marks,
          reason: value.reason.trim(),
        },
        {
          onSuccess: () => {
            toast.success("Result overridden.");
            form.reset();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Override failed.")),
        },
      );
    },
  });

  return (
    <DashboardPanel
      title="Override a single result"
      subtitle="PATCH /results/:resultId/override — only way to change a PUBLISHED result. This is audit-logged."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-md flex-col gap-3"
      >
        <form.Field name="resultId">
          {(field) => (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Result ID
              <Input
                placeholder="Paste the result ID…"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="marksObtained">
          {(field) => (
            <label className="flex flex-col gap-1 text-sm font-medium">
              New marks
              <Input
                type="number"
                min={0}
                placeholder="e.g. 85"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="reason">
          {(field) => (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Reason{" "}
              <span className="font-normal text-muted-foreground">
                (required)
              </span>
              <Input
                placeholder="e.g. Re-check found a totaling error…"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>

        <Button type="submit" disabled={override.isPending}>
          {override.isPending ? "Saving…" : "Override result"}
        </Button>
      </form>
    </DashboardPanel>
  );
}

// Task 26: admin result publish + single-result override.
export default function ResultsPublishManager() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Publish results"
        subtitle="Publish an exam's draft results, or override one published result."
      />
      <PublishCard />
      <OverrideCard />
    </div>
  );
}
