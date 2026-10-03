"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Course } from "@/components/types";
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
  useCourses,
  useCreateCourse,
  useDepartments,
  useUpdateCourse,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

interface CourseModalProps {
  open: boolean;
  editing: Course | null;
  onClose: () => void;
}

// Create + edit modal. editing === null means "create new".
export default function CourseModal({ open, editing, onClose, }: CourseModalProps) {
  
  const [code, setCode] = useState(editing?.code ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [creditHours, setCreditHours] = useState(
    String(editing?.creditHours ?? 3),
  );
  const [departmentId, setDepartmentId] = useState(editing?.departmentId ?? "");
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>(
    editing?.prerequisites?.map((p) => p.id) ?? [],
  );

  const departments = useDepartments(1);
  const allCourses = useCourses();
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const busy = create.isPending || update.isPending;

  // Prerequisites cannot include the course itself.
  const prerequisiteOptions = (allCourses.data ?? []).filter(
    (c) => c.id !== editing?.id,
  );

  function togglePrerequisite(id: string) {
    setPrerequisiteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function save() {
    const credits = Number(creditHours);
    if (code.trim().length < 2 || title.trim().length < 2) {
      toast.error("Code and title need at least 2 characters.");
      return;
    }
    if (!credits || credits < 1 || credits > 6) {
      toast.error("Credit hours must be between 1 and 6.");
      return;
    }

    if (editing) {
      // Code and department cannot change after creation (backend rule).
      update.mutate(
        {
          id: editing.id,
          title: title.trim(),
          creditHours: credits,
          prerequisiteCourseIds: prerequisiteIds,
        },
        {
          onSuccess: () => {
            toast.success("Course updated.");
            onClose();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Update failed.")),
        },
      );
    } else {
      if (!departmentId) {
        toast.error("Pick a department first.");
        return;
      }
      create.mutate(
        {
          code: code.trim(),
          title: title.trim(),
          creditHours: credits,
          departmentId,
          prerequisiteCourseIds: prerequisiteIds,
        },
        {
          onSuccess: () => {
            toast.success("Course created.");
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
          <DialogTitle>{editing ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Code and department are fixed after creation."
              : "Code must be unique, e.g. “CSE-101”."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="course-code">Code</label>
            <Input
              id="course-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CSE-101"
              disabled={!!editing}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="course-title">Title</label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Intro to Programming"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="course-credits">Credit hours (1–6)</label>
            <Input
              id="course-credits"
              type="number"
              min={1}
              max={6}
              value={creditHours}
              onChange={(e) => setCreditHours(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="course-dept">Department</label>
            <select
              id="course-dept"
              className={inputClass}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={!!editing}
            >
              <option value="">Select department…</option>
              {(departments.data?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Prerequisites (tick any)</p>
            {prerequisiteOptions.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                No other courses yet.
              </p>
            ) : (
              <ul className="flex max-h-44 flex-col gap-1 overflow-y-auto rounded-xl border p-2">
                {prerequisiteOptions.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={prerequisiteIds.includes(c.id)}
                        onChange={() => togglePrerequisite(c.id)}
                      />
                      <span className="font-semibold">{c.code}</span>
                      <span className="truncate text-muted-foreground">
                        {c.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
