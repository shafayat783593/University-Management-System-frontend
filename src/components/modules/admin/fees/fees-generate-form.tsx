"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Semester } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateFees } from "@/hooks";
import { useSemesters } from "@/hooks/enrollments.hook";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

function GenerateForm({
  semesters,
  defaultSemesterId,
}: {
  semesters: Semester[];
  defaultSemesterId: string;
}) {
  const generate = useGenerateFees();

  const form = useForm({
    defaultValues: {
      semesterId: defaultSemesterId,
      amount: "",
      dueDate: "",
    },
    onSubmit: ({ value }) => {
      const amountNumber = Number(value.amount);
      if (!value.semesterId) {
        return toast.error("Please select a semester.");
      }
      if (!amountNumber || amountNumber <= 0) {
        return toast.error("Amount must be a positive number.");
      }
      const ok = window.confirm(
        `Generate a fee of ${amountNumber} for every active student?`,
      );
      if (!ok) return;

      generate.mutate(
        {
          semesterId: value.semesterId,
          amount: amountNumber,
          dueDate: value.dueDate || undefined,
        },
        {
          onSuccess: (result) => {
            toast.success(
              `Generated ${result?.generatedCount ?? 0} fees (out of ${result?.totalActiveStudents ?? 0} active students).`,
            );
            form.reset();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Fee generation failed.")),
        },
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex max-w-md flex-col gap-3"
    >
      <form.Field name="semesterId">
        {(field) => (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Semester
            <select
              className={inputClass}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </label>
        )}
      </form.Field>

      <form.Field name="amount">
        {(field) => (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Amount
            <Input
              type="number"
              min={1}
              placeholder="e.g. 5000"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </label>
        )}
      </form.Field>

      <form.Field name="dueDate">
        {(field) => (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Due date{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
            <Input
              type="date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </label>
        )}
      </form.Field>

      <Button type="submit" disabled={generate.isPending}>
        {generate.isPending ? "Generating…" : "Generate fees"}
      </Button>
    </form>
  );
}

// Task 24: pick a semester + amount → POST /fees/generate.
// One fee row is created for every active student (duplicates are skipped).
export default function FeesGenerateForm() {
  const semestersQuery = useSemesters();
  const semesters = semestersQuery.data?.items ?? [];

  // Default to the OPEN semester, like the student enroll page does.
  const open = semesters.find((s) => s.status === "OPEN");
  const defaultSemesterId = (open ?? semesters[0])?.id ?? "";

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Generate fees"
        subtitle="Create one fee row per active student for a semester."
      />

      <DashboardPanel title="New fee batch">
        {semestersQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : semestersQuery.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load semesters.</p>
            <button
              type="button"
              onClick={() => semestersQuery.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : semesters.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No semesters yet. Create one first.
          </p>
        ) : (
          <GenerateForm
            key={defaultSemesterId}
            semesters={semesters}
            defaultSemesterId={defaultSemesterId}
          />
        )}
      </DashboardPanel>
    </div>
  );
}
