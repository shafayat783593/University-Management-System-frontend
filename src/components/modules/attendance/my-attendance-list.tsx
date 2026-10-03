"use client";

import { format } from "date-fns";
import { CalendarCheck, CalendarX2 } from "lucide-react";

import {
  DashboardPageHeader,
  StatCards,
} from "@/components/dashboard/dashboard-ui";
import type {
  AttendanceRecord,
  SectionAttendanceGroup,
} from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAttendance } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

/* Helpers (pure, easy to test) ----------------------------------- */

// Group a flat record list by section so each course reads as one card.
function groupBySection(records: AttendanceRecord[]): SectionAttendanceGroup[] {
  const map = new Map<string, SectionAttendanceGroup>();

  for (const record of records) {
    const sectionId = record.session.sectionId;
    let group = map.get(sectionId);

    if (!group) {
      group = {
        sectionId,
        courseCode: record.session.section.course.code,
        courseTitle: record.session.section.course.title,
        records: [],
        presentCount: 0,
        totalCount: 0,
        percentage: 0,
      };
      map.set(sectionId, group);
    }

    group.records.push(record);
    group.totalCount += 1;
    if (record.status === "PRESENT") group.presentCount += 1;
  }

  for (const group of map.values()) {
    group.records.sort(
      (a, b) => +new Date(b.session.date) - +new Date(a.session.date),
    );
    group.percentage =
      group.totalCount === 0
        ? 0
        : Math.round((group.presentCount / group.totalCount) * 100);
  }

  return [...map.values()];
}

function formatSessionDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return iso;
  return format(date, "EEE, MMM d yyyy");
}

function percentageTone(percentage: number) {
  if (percentage >= 75) return "success" as const;
  if (percentage >= 50) return "warning" as const;
  return "destructive" as const;
}

/* Small pieces --------------------------------------------------- */

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const isPresent = record.status === "PRESENT";

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm">
      <span className="font-medium">
        {formatSessionDate(record.session.date)}
      </span>
      <Badge variant={isPresent ? "success" : "destructive"}>
        {isPresent ? "Present" : "Absent"}
      </Badge>
    </li>
  );
}

function SectionAttendanceCard({ group }: { group: SectionAttendanceGroup }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-primary">
            {group.courseCode}
          </p>
          <h3 className="text-[15px] font-bold">{group.courseTitle}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {group.presentCount} of {group.totalCount} sessions attended
          </p>
        </div>
        <Badge variant={percentageTone(group.percentage)}>
          {group.percentage}%
        </Badge>
      </div>

      {/* Simple progress bar */}
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={group.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${group.percentage}%` }}
        />
      </div>

      <ul className="flex flex-col gap-2">
        {group.records.map((record) => (
          <AttendanceRow key={record.id} record={record} />
        ))}
      </ul>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <CalendarCheck className="size-5" />
      </span>
      <p className="text-sm font-semibold">No attendance yet</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">
        Your instructors have not marked attendance for any of your sections.
        Check back after your next class.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <CalendarX2 className="size-5" />
      </span>
      <p className="text-sm font-semibold">Could not load attendance</p>
      <p className="text-[13px] text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
      >
        Retry
      </button>
    </div>
  );
}

/* Main ------------------------------------------------------------ */

export default function MyAttendanceList() {
  
  const query = useMyAttendance();
  const records = query.data ?? [];
  const groups = groupBySection(records);

  const totalSessions = records.length;
  const totalPresent = records.filter((r) => r.status === "PRESENT").length;
  const overall =
    totalSessions === 0 ? 0 : Math.round((totalPresent / totalSessions) * 100);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My attendance"
        subtitle="Grouped by course — newest session first."
      />

      {query.isLoading ? (
        <LoadingSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error, "Try again in a moment.")}
          onRetry={() => query.refetch()}
        />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatCards
            stats={[
              {
                label: "Overall attendance",
                value: `${overall}%`,
                hint: `${totalPresent} present of ${totalSessions} sessions`,
                icon: CalendarCheck,
                tone: "green",
              },
              {
                label: "Enrolled courses",
                value: String(groups.length),
                hint: "Courses with marked sessions",
                icon: CalendarCheck,
                tone: "violet",
              },
            ]}
          />

          <div className="grid items-start gap-3 md:grid-cols-2">
            {groups.map((group) => (
              <SectionAttendanceCard key={group.sectionId} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
