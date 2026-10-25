"use client";

import { CalendarDays, Trash2 } from "lucide-react";
import { FetchError } from "ofetch";
import { useState } from "react";
import { toast } from "sonner";
import type { InstructorRoutineEntry } from "@/api";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAuth,
  useCreateRoutineEntry,
  useDeleteRoutineEntry,
  useInstructorSections,
  useMyInstructorRoutine,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function dayLabel(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function groupByDay(entries: InstructorRoutineEntry[]) {
  const groups = new Map<string, InstructorRoutineEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    groups.set(entry.dayOfWeek, list);
  }
  return DAYS.filter((day) => groups.has(day)).map((day) => ({
    day,
    entries: groups.get(day) ?? [],
  }));
}

function DeleteButton({ id }: { id: string }) {
  const remove = useDeleteRoutineEntry();

  function handleDelete() {
    const ok = window.confirm("Delete this class entry?");
    if (!ok) return;
    remove.mutate(id, {
      onSuccess: () => toast.success("Routine entry deleted."),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not delete.")),
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={remove.isPending}
      onClick={handleDelete}
    >
      <Trash2 className="size-3.5" />
      {remove.isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}

// Add-entry form: section picker is scoped to the instructor's OWN sections.
function AddEntryForm() {
  const { data: me } = useAuth();
  const instructorId = me?.data?.instructorProfile?.id;

  const sectionsQuery = useInstructorSections(instructorId);
  const sections = sectionsQuery.data?.items ?? [];

  const [sectionId, setSectionId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("MONDAY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  const create = useCreateRoutineEntry();

  function handleAdd() {
    if (!sectionId) {
      toast.error("Pick a section.");
      return;
    }
    if (!startTime || !endTime) {
      toast.error("Pick a start and end time.");
      return;
    }
    create.mutate(
      {
        sectionId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() ? room.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Class added to your routine.");
          setStartTime("");
          setEndTime("");
          setRoom("");
        },
        onError: (err) => {
          // 409 = real scheduling conflict, show its message — not generic.
          if (err instanceof FetchError && err.status === 409) {
            toast.error("Overlapping class", {
              description: getApiErrorMessage(
                err,
                "You already have a class at this time on this day.",
              ),
            });
            return;
          }
          toast.error(getApiErrorMessage(err, "Could not add class."));
        },
      },
    );
  }

  if (!instructorId || sectionsQuery.isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_140px_130px_130px_120px_auto] lg:items-end">
      <label className="grid gap-1 text-[13px] font-semibold">
        Section
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
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
        Day
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="h-9 rounded-xl border bg-background px-3 text-sm font-normal"
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {dayLabel(d)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-[13px] font-semibold">
        Start
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="h-9"
        />
      </label>

      <label className="grid gap-1 text-[13px] font-semibold">
        End
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="h-9"
        />
      </label>

      <label className="grid gap-1 text-[13px] font-semibold">
        Room{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <Input
          placeholder="A-101"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="h-9"
        />
      </label>

      <Button onClick={handleAdd} disabled={create.isPending}>
        {create.isPending ? "Adding…" : "Add class"}
      </Button>
    </div>
  );
}

// entries (conflict-checked: 409 = overlapping class).
export default function InstructorRoutine() {
  const query = useMyInstructorRoutine();
  const entries = query.data ?? [];
  const days = groupByDay(entries);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My class routine"
        subtitle="Your weekly teaching schedule — add or remove classes below."
      />

      <AddEntryForm />

      {query.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load routine</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="size-5" />
          </span>
          <p className="text-sm font-semibold">No classes scheduled</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Add your first class with the form above.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-2">
          {days.map(({ day, entries: dayEntries }) => (
            <section
              key={day}
              className="rounded-2xl border bg-card p-5 shadow-soft"
            >
              <h2 className="text-[15px] font-bold">{dayLabel(day)}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {dayEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-wide text-primary">
                        {entry.section.course.code}
                      </p>
                      <p className="truncate text-sm font-bold">
                        {entry.section.course.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {entry.startTime} – {entry.endTime}
                        {entry.room ? ` · Room ${entry.room}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{dayLabel(day)}</Badge>
                      <DeleteButton id={entry.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
