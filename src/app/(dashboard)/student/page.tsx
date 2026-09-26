import Link from "next/link";
import { ArrowRight, BookOpen, CreditCard, GraduationCap, Trophy } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";

const stats = [
  { label: "Enrolled Courses", value: "6", hint: "Spring semester", icon: BookOpen, tone: "violet" as const },
  { label: "CGPA", value: "3.78", hint: "Last updated Fall 2025", icon: Trophy, trend: "+0.12", tone: "amber" as const },
  { label: "Credits Completed", value: "98", hint: "Out of 130 required", icon: GraduationCap, tone: "green" as const },
  { label: "Due Payments", value: "$450", hint: "Pay before Mar 30", icon: CreditCard, tone: "blue" as const },
];

const courses = [
  { code: "CSE 401", title: "Machine Learning", progress: 72, instructor: "Dr. Tanvir Ahmed" },
  { code: "CSE 402", title: "Distributed Systems", progress: 54, instructor: "Prof. Nusrat Jahan" },
  { code: "MAT 301", title: "Linear Algebra II", progress: 88, instructor: "Dr. Kamal Hossain" },
];

export default function StudentOverview() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My learning dashboard"
        subtitle="Track your courses, results and upcoming deadlines."
        action={
          <Link
            href="/student/enroll"
            className="gradient-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-pop transition-opacity hover:opacity-90"
          >
            Enroll in course
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <StatCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardPanel
          title="Continue learning"
          subtitle="Pick up where you left off"
          className="lg:col-span-3"
          action={
            <Link href="/student/courses" className="text-[13px] font-semibold text-primary hover:underline">
              All courses
            </Link>
          }
        >
          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <div key={c.code} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wide text-primary">{c.code}</p>
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.instructor}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold">
                    {c.progress}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="gradient-brand h-full rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Upcoming" subtitle="Deadlines this week" className="lg:col-span-2">
          <ul className="flex flex-col gap-3 text-sm">
            {[
              { t: "ML Assignment 4", d: "Due tomorrow · CSE 401" },
              { t: "Midterm — Linear Algebra", d: "Thu, 10:00 AM · MAT 301" },
              { t: "Tuition fee installment", d: "Due Mar 30 · $450" },
            ].map((x) => (
              <li key={x.t} className="flex gap-3 rounded-xl bg-muted/60 p-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <span>
                  <span className="block font-semibold">{x.t}</span>
                  <span className="block text-xs text-muted-foreground">{x.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>
    </div>
  );
}
