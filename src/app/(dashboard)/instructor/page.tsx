import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, PlusCircle, Users } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";

const stats = [
  { label: "My Courses", value: "4", hint: "Spring semester", icon: BookOpen, tone: "violet" as const },
  { label: "Total Students", value: "312", hint: "Across your courses", icon: Users, trend: "+18", tone: "green" as const },
  { label: "Classes This Week", value: "9", hint: "3 labs · 6 lectures", icon: CalendarDays, tone: "blue" as const },
  { label: "Pending Reviews", value: "27", hint: "Assignments to grade", icon: PlusCircle, tone: "amber" as const },
];

const classes = [
  { code: "CSE 401", title: "Machine Learning", time: "Today · 10:00 AM", room: "Room 304" },
  { code: "CSE 402", title: "Distributed Systems", time: "Tomorrow · 1:30 PM", room: "Lab 2" },
  { code: "CSE 310", title: "Operating Systems Lab", time: "Thu · 9:00 AM", room: "Lab 1" },
];

export default function InstructorOverview() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Welcome back, Professor"
        subtitle="Manage your courses, students and class schedule."
        action={
          <Link
            href="/instructor/courses/new"
            className="gradient-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-pop transition-opacity hover:opacity-90"
          >
            <PlusCircle className="size-4" />
            New course
          </Link>
        }
      />

      <StatCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardPanel
          title="Upcoming classes"
          subtitle="Your teaching schedule"
          className="lg:col-span-3"
          action={
            <Link href="/instructor/schedule" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
              Full schedule <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <ul className="flex flex-col divide-y divide-border">
            {classes.map((c) => (
              <li key={c.code} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="gradient-brand-soft grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-primary">
                  {c.code.split(" ")[1]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {c.code} — {c.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.time} · {c.room}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Needs attention" subtitle="Grade pending work" className="lg:col-span-2">
          <div className="flex flex-col gap-2.5">
            {[
              { t: "ML Assignment 4", d: "18 submissions waiting" },
              { t: "OS Lab Report 6", d: "9 submissions waiting" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border p-3.5">
                <p className="text-sm font-semibold">{x.t}</p>
                <p className="text-xs text-muted-foreground">{x.d}</p>
                <button
                  type="button"
                  className="mt-2.5 h-8 rounded-lg bg-muted px-3 text-xs font-semibold transition-colors hover:bg-primary hover:text-white"
                >
                  Start grading
                </button>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
