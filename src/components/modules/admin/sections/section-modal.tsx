"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Section } from "@/components/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useApprovedInstructors,
  useCourses,
  useCreateSection,
  useUpdateSection,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { useSemesters } from "@/hooks/enrollments.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

interface SectionModalProps {
  open: boolean;
  editing: Section | null;
  onClose: () => void;
}

// Create + edit modal. editing === null means "create new".
export default function SectionModal({
  open,
  editing,
  onClose,
}: SectionModalProps) {
  const [courseId, setCourseId] = useState(editing?.courseId ?? "");
  const [semesterId, setSemesterId] = useState(editing?.semesterId ?? "");
  const [instructorId, setInstructorId] = useState(editing?.instructorId ?? "");
  const [capacity, setCapacity] = useState(String(editing?.capacity ?? 40));
  const [schedule, setSchedule] = useState(editing?.schedule ?? "");

  const courses = useCourses();
  const semesters = useSemesters(1);
  const instructors = useApprovedInstructors();
  const create = useCreateSection();
  const update = useUpdateSection();
  const busy = create.isPending || update.isPending;

  function save() {
    const seats = Number(capacity);
    if (!seats || seats < 1) {
      toast.error("Capacity must be at least 1.");
      return;
    }

    if (editing) {
      // Course and semester are fixed after creation (backend rule).
      update.mutate(
        {
          id: editing.id,
          instructorId: instructorId || undefined,
          capacity: seats,
          schedule: schedule.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Section updated.");
            onClose();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Update failed.")),
        },
      );
    } else {
      if (!courseId || !semesterId || !instructorId) {
        toast.error("Pick a course, semester, and instructor.");
        return;
      }
      create.mutate(
        {
          courseId,
          semesterId,
          instructorId,
          capacity: seats,
          schedule: schedule.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Section created.");
            onClose();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Create failed.")),
        },
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit section" : "New section"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Course and semester are fixed after creation."
              : "Only approved instructors can be assigned."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sec-course">Course</label>
            <select
              id="sec-course"
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={!!editing}
            >
              <option value="">Select course…</option>
              {(courses.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sec-semester">Semester</label>
            <select
              id="sec-semester"
              className={inputClass}
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              disabled={!!editing}
            >
              <option value="">Select semester…</option>
              {(semesters.data?.items ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sec-instructor">Instructor (approved only)</label>
            <select
              id="sec-instructor"
              className={inputClass}
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
            >
              <option value="">Select instructor…</option>
              {(instructors.data ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.user.name} — {i.department.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sec-capacity">Capacity</label>
            <Input
              id="sec-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sec-schedule">Schedule (optional)</label>
            <Input
              id="sec-schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Mon 10:00–11:30"
            />
          </div>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
