"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, CreditCard, GraduationCap } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentDashboard } from "@/hooks";

const toneClasses: Record<"danger" | "warning" | "info" | "success", string> = {
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
  warning: "border-warning/30 bg-warning/5 text-warning",
  info: "border-info/30 bg-info/5 text-info",
  success: "border-success/30 bg-success/5 text-success",
};

export default function StudentDashboard() {
  const q = useStudentDashboard();

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
  const attendancePct = d.academics.attendance.percentage;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={`Welcome back, ${d.profile.name.split(" ")[0]}`}
        subtitle={
          d.semester
            ? `${d.semester.name} • ${d.profile.department.name} (${d.profile.department.code})`
            : `${d.profile.department.name} (${d.profile.department.code}) • No open semester`
        }
      />

      {/* Next step */}
      <div className={`rounded-2xl border p-5 ${toneClasses[d.nextStep.tone]}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{d.nextStep.title}</p>
            <p className="mt-1 text-[13px] opacity-90">{d.nextStep.description}</p>
          </div>
          {d.nextStep.href ? (
            <Link
              href={d.nextStep.href}
              className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Take action
            </Link>
          ) : null}
        </div>
      </div>

      <StatCards
        stats={[
          {
            label: "Enrolled courses",
            value: String(d.academics.enrolledCourses),
            hint: `${d.academics.enrolledCredits} credits`,
            icon: BookOpen,
            tone: "violet",
          },
          {
            label: "Attendance",
            value: attendancePct == null ? "—" : `${attendancePct}%`,
            hint: `${d.academics.attendance.present}/${d.academics.attendance.totalClasses} classes`,
            icon: CalendarDays,
            tone: d.academics.attendance.lowAttendance ? "amber" : "green",
          },
          {
            label: "Total fees",
            value: `৳${d.billing.totalFees}`,
            hint: `৳${d.billing.totalPaid} paid`,
            icon: CreditCard,
            tone: "blue",
          },
          {
            label: "Outstanding",
            value: `৳${d.billing.outstandingBalance}`,
            hint: `${d.billing.overdueInstallments.length} overdue`,
            icon: CreditCard,
            tone: d.billing.outstandingBalance > 0 ? "amber" : "green",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Admission */}
        <DashboardPanel
          title="Admission progress"
          subtitle={d.profile.studentIdCode ? `Student ID: ${d.profile.studentIdCode}` : "Student ID pending"}
          className="lg:col-span-2"
        >
          <ul className="flex flex-col gap-2">
            {d.admission.steps.map((s) => (
              <li key={s.key} className="flex items-center justify-between text-sm">
                <span className={s.state === "done" ? "font-medium" : "text-muted-foreground"}>
                  {s.label}
                </span>
                <Badge
                  variant={
                    s.state === "done"
                      ? "success"
                      : s.state === "current"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {s.state}
                </Badge>
              </li>
            ))}
          </ul>
          {d.admission.applicationStatus ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Application status: {d.admission.applicationStatus}
              {d.admission.rejectionReason ? ` — ${d.admission.rejectionReason}` : ""}
            </p>
          ) : null}
        </DashboardPanel>

        {/* Billing */}
        <DashboardPanel
          title="Billing"
          subtitle={`${d.billing.invoiceCount} invoices`}
          className="lg:col-span-3"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground">Total fees</p>
              <p className="mt-1 text-xl font-bold">৳{d.billing.totalFees}</p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="mt-1 text-xl font-bold">৳{d.billing.totalPaid}</p>
            </div>
            <div className="rounded-xl border p-3.5">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="mt-1 text-xl font-bold">৳{d.billing.outstandingBalance}</p>
            </div>
          </div>
          {d.billing.nextInstallment ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Next installment is due — see My Fees for details.
            </p>
          ) : null}
          <Link
            href="/student/payments/my-fees"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
          >
            Open fees <GraduationCap className="size-3.5" />
          </Link>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Courses */}
        <DashboardPanel title="My courses" subtitle={`${d.academics.courses.length} this semester`}>
          {d.academics.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses enrolled yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {d.academics.courses.map((c) => (
                <li key={c.sectionId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="gradient-brand-soft grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-primary">
                    {c.creditHours}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.code} — {c.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {c.instructorName} {c.schedule ? `• ${c.schedule}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        {/* Attendance by course */}
        <DashboardPanel title="Attendance by course" subtitle="Per-course percentage">
          {d.academics.attendance.byCourse.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {d.academics.attendance.byCourse.map((c) => (
                <li key={c.code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {c.code} — {c.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {c.present}/{c.total} ({c.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      {/* Routine */}
      {d.routine.nextClass ? (
        <DashboardPanel title="Next class" subtitle="Coming up">
          <p className="text-sm font-semibold">
            {d.routine.nextClass.course.code} — {d.routine.nextClass.course.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {d.routine.nextClass.startTime}–{d.routine.nextClass.endTime}
            {d.routine.nextClass.room ? ` • ${d.routine.nextClass.room}` : ""}
          </p>
          <Link href="/student/routine" className="mt-2 inline-flex text-[13px] font-semibold text-primary hover:underline">
            Full routine
          </Link>
        </DashboardPanel>
      ) : null}

      {/* Announcements */}
      <DashboardPanel title="Announcements" subtitle="Latest updates" className="">
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

      <p className="hidden text-xs text-muted-foreground">{d.profile.email}</p>
    </div>
  );
}
