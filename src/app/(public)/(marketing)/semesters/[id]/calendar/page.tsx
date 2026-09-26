import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CircleDot,
} from "lucide-react";
import { getSemesterCalendar } from "@/api/announcements.api";
import type { SemesterCalendarEvent } from "@/components/types";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const calendar = await getSemesterCalendar(id);
    return {
      title: `${calendar.semesterName} Calendar | UniManage`,
      description: `Academic calendar for ${calendar.semesterName}: enrollment, exams and result dates.`,
    };
  } catch {
    return { title: "Semester Calendar | UniManage" };
  }
}

function formatDay(value: string | null) {
  if (!value) return "";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return "";
  }
}

function EventDate({ event }: { event: SemesterCalendarEvent }) {
  const start = formatDay(event.start);
  const end = formatDay(event.end);
  // Some events have start === end (e.g. Result Publish Date) —
  // show a single date instead of a redundant range.
  if (start && end && start !== end) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
        <CalendarRange className="size-3.5" />
        {start} → {end}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
      <CalendarDays className="size-3.5" />
      {start || end || "Date to be announced"}
    </span>
  );
}

export default async function SemesterCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let calendar;
  try {
    calendar = await getSemesterCalendar(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-[28px]">
        {calendar.semesterName} — Academic Calendar
      </h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Key dates for enrollment, examinations and result publication.
      </p>

      {calendar.events.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm font-semibold">No dates published yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
            The administration has not set the calendar dates for this semester.
          </p>
        </div>
      ) : (
        <ol className="mt-6 flex flex-col gap-0">
          {calendar.events.map((event, i) => (
            <li key={`${event.type}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
              {/* timeline rail */}
              <span className="flex flex-col items-center">
                <CircleDot className="size-5 shrink-0 text-primary" />
                {i < calendar.events.length - 1 ? (
                  <span className="w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </span>
              <div className="flex-1 rounded-2xl border bg-card p-4 shadow-soft">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {event.type}
                </p>
                <p className="mt-0.5 text-[15px] font-bold">{event.label}</p>
                <div className="mt-1.5">
                  <EventDate event={event} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
