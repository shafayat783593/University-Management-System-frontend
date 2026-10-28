"use client";

import Link from "next/link";
import { AlertTriangle, BookOpen, CalendarDays, Users } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorDashboard } from "@/hooks";

export default function InstructorDashboard() {
  const q = useInstructorDashboard();

  if (q.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load dashboard</p>
        <p className="text-[13px] text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => q.refetch()}
          className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = q.data;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={`Welcome back, ${d.profile.name.split(" ")[0]}`}
        subtitle={
          d.semester
            ? `${d.semester.name} • ${d.profile.department.name} (${d.profile.department.code})`
            : `${d.profile.department.name} (${d.profile.department.code}) • No open semester`
        }
        action={
          <Link
            href="/instructor/sections"
            className="gradient-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-pop transition-opacity hover:opacity-90"
          >
            My sections
          </Link>
        }
      />

      <StatCards
        stats={[
          {
            label: "Sections",
            value: String(d.stats.sections),
            hint: `${d.stats.students} students`,
            icon: BookOpen,
            tone: "violet",
          },
          {
            label: "Classes today",
            value: String(d.stats.classesToday),
            hint: "Scheduled today",
            icon: CalendarDays,
            tone: "blue",
          },
          {
            label: "Upcoming exams",
            value: String(d.stats.upcomingExams),
            hint: "Needs attention",
            icon: AlertTriangle,
            tone: "amber",
          },
          {
            label: "Pending result submissions",
            value: String(d.stats.pendingResultSubmissions),
            hint: "Past exams with missing marks",
            icon: Users,
            tone: d.stats.pendingResultSubmissions > 0 ? "amber" : "green",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Sections */}
        <DashboardPanel
          title="My sections"
          subtitle={`${d.sections.length} sections`}
          className="lg:col-span-3"
          action={
            <Link href="/instructor/sections" className="text-[13px] font-semibold text-primary hover:underline">
              Manage
            </Link>
          }
        >
          {d.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections assigned.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {d.sections.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="gradient-brand-soft grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-primary">
                    {s.course.code.split(" ")[1] ?? s.course.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {s.course.code} — {s.course.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.enrolledStudents}/{s.capacity} students
                      {s.schedule ? ` • ${s.schedule}` : ""}
                      {s.attendanceTakenToday ? " • attendance taken" : ""}
                    </span>
                  </span>
                  {!s.attendanceTakenToday ? (
                    <Badge variant="warning">Attendance pending</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        {/* Pending actions */}
        <DashboardPanel
          title="Needs attention"
          subtitle="Take these next"
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-2.5">
            {d.pendingActions.attendanceToTake.map((a) => (
              <div key={a.sectionId} className="rounded-xl border p-3.5">
                <p className="text-sm font-semibold">{a.courseCode} attendance</p>
                <p className="text-xs text-muted-foreground">
                  {a.courseTitle} • class at {a.startTime}
                </p>
                <Link
                  href={`/instructor/sections/${a.sectionId}/attendance`}
                  className="mt-2.5 inline-flex h-8 items-center rounded-lg bg-muted px-3 text-xs font-semibold transition-colors hover:bg-primary hover:text-white"
                >
                  Take attendance
                </Link>
              </div>
            ))}
            {d.pendingActions.resultsToSubmit.map((r) => (
              <div key={r.examId} className="rounded-xl border p-3.5">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.courseCode} • {r.submitted}/{r.enrolled} submitted
                </p>
              </div>
            ))}
            {d.pendingActions.attendanceToTake.length === 0 &&
            d.pendingActions.resultsToSubmit.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing needs attention.</p>
            ) : null}
          </div>
        </DashboardPanel>
      </div>

      {/* Routine today */}
      {d.routine.nextClass ? (
        <DashboardPanel title="Next class" subtitle="Coming up">
          <p className="text-sm font-semibold">
            {d.routine.nextClass.course.code} — {d.routine.nextClass.course.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {d.routine.nextClass.startTime}–{d.routine.nextClass.endTime}
            {d.routine.nextClass.room ? ` • ${d.routine.nextClass.room}` : ""}
          </p>
          <Link href="/instructor/routine" className="mt-2 inline-flex text-[13px] font-semibold text-primary hover:underline">
            Full routine
          </Link>
        </DashboardPanel>
      ) : null}

      {/* Upcoming exams */}
      <DashboardPanel title="Upcoming exams" subtitle="Scheduled">
        {d.upcomingExams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming exams.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {d.upcomingExams.map((e) => (
              <li key={e.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold">
                  {e.course.code} — {e.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.examType} • {e.examDate ? new Date(e.examDate).toLocaleDateString() : "Date TBD"} • {e.totalMarks} marks
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      {/* Announcements */}
      <DashboardPanel title="Announcements" subtitle="Latest updates">
        {d.announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements right now.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {d.announcements.map((a) => (
              <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  );
}
