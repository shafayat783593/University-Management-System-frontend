"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { Semester } from "@/components/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateSemesterDates } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const FIELDS = [
  { name: "enrollmentStart", label: "Enrollment start" },
  { name: "enrollmentEnd", label: "Enrollment end" },
  { name: "examWeekStart", label: "Exam week start" },
  { name: "examWeekEnd", label: "Exam week end" },
  { name: "resultPublishDate", label: "Result publish date" },
] as const;

// API date -> datetime-local input format ("YYYY-MM-DDTHH:mm")
function toInputValue(date?: string | null) {
  const d = date ? new Date(date) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Khali thakle undefined (mane: change korbo na)
function toIso(value: string) {
  const d = new Date(value);
  return value && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined;
}

function DatesForm({
  semester,
  onClose,
}: {
  semester: Semester;
  onClose: () => void;
}) {
  const saveDates = useUpdateSemesterDates();

  const form = useForm({
    defaultValues: {
      enrollmentStart: toInputValue(semester.enrollmentStart),
      enrollmentEnd: toInputValue(semester.enrollmentEnd),
      examWeekStart: toInputValue(semester.examWeekStart),
      examWeekEnd: toInputValue(semester.examWeekEnd),
      resultPublishDate: toInputValue(semester.resultPublishDate),
    },
    onSubmit: ({ value }) => {
      if (value.enrollmentStart && value.enrollmentEnd && value.enrollmentStart > value.enrollmentEnd) {
        return toast.error("Enrollment start must be before enrollment end.");
      }
      if (value.examWeekStart && value.examWeekEnd && value.examWeekStart > value.examWeekEnd) {
        return toast.error("Exam week start must be before exam week end.");
      }

      saveDates.mutate(
        {
          id: semester.id,
          enrollmentStart: toIso(value.enrollmentStart),
          enrollmentEnd: toIso(value.enrollmentEnd),
          examWeekStart: toIso(value.examWeekStart),
          examWeekEnd: toIso(value.examWeekEnd),
          resultPublishDate: toIso(value.resultPublishDate),
        },
        {
          onSuccess: () => {
            toast.success("Calendar dates saved.");
            onClose();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Could not save dates.")),
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
      className="flex flex-col gap-3"
    >
      {FIELDS.map(({label,name }) => (
        <form.Field key={name} name={name}>
          {(field) => (
            <label className="flex flex-col gap-1 text-sm font-medium">
              {label}
              <Input
                type="datetime-local"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
      ))}

      <Button type="submit" disabled={saveDates.isPending}>
        {saveDates.isPending ? "Saving…" : "Save dates"}
      </Button>
    </form>
  );
}

interface Props {
  open: boolean;
  semester: Semester | null;
  onClose: () => void;
}

export default function SemesterDatesModal({ open, semester, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calendar dates</DialogTitle>
          {semester && (
            <DialogDescription>
              Set enrollment, exam week and result dates for {semester.name}.
            </DialogDescription>
          )}
        </DialogHeader>

        {semester && <DatesForm semester={semester} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}