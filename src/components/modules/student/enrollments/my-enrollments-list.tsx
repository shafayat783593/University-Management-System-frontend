"use client";

import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import type { Enrollment } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEnrollments } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

// One card for one enrollment. Keeps the list easy to read.
function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const section = enrollment.section;
  const isOpen = section.semester.status === "OPEN";
  const isActive = enrollment.status === "ENROLLED";

  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-primary">
            {section.course.code}
          </p>
          <h3 className="text-[15px] font-bold">{section.course.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Clock className="size-3.5" />
            {section.schedule} · {section.semester.name}
          </p>
        </div>

        <Badge
          variant={
            enrollment.status === "ENROLLED"
              ? "success"
              : enrollment.status === "WITHDRAWN"
                ? "secondary"
                : "destructive"
          }
        >
          {enrollment.status}
        </Badge>
      </div>

      <div className="mt-auto flex gap-2 pt-1">
        <Link
          href={`/student/results/sections/${section.id}`}
          className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Result
        </Link>
        {isActive ? (
          <Button type="button" disabled>
            Withdrawn
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export default function MyEnrollmentsList() {
  const query = useMyEnrollments();
  const items = query.data ?? [];

  // Show only active ones at the top, keep history below
  const active = items.filter((e) => e.status === "ENROLLED");
  const history = items.filter((e) => e.status !== "ENROLLED");

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My enrollments"
        subtitle="Drop a section while enrollment is open, or withdraw later."
        action={
          <Link
            href="/student/enrollments"
            className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
          >
            <BookOpen className="mr-1.5 size-4" />
            Browse sections
          </Link>
        }
      />

      {active.length > 0 ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] font-medium">
          Dropping a course after your invoice is issued does not reduce it automatically — contact the office.
        </p>
      ) : null}

      {query.isLoading ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load enrollments</p>
          <p className="text-[13px] text-muted-foreground">
            {getApiErrorMessage(query.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <BookOpen className="size-5" />
          </span>
          <p className="text-sm font-semibold">No enrollments yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            You have not enrolled in any section. Browse open sections to get
            started.
          </p>
          <Link
            href="/student/enrollments"
            className="mt-2 inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Browse sections
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-muted-foreground">
            {active.length} active · {items.length} total
          </p>

          <ul className="grid gap-3 md:grid-cols-2">
            {active.map((e) => (
              <EnrollmentCard key={e.id} enrollment={e} />
            ))}
          </ul>

          {history.length > 0 ? (
            <>
              <h2 className="mt-2 text-sm font-bold text-muted-foreground">
                Past enrollments
              </h2>
              <ul className="grid gap-3 opacity-80 md:grid-cols-2">
                {history.map((e) => (
                  <EnrollmentCard key={e.id} enrollment={e} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
