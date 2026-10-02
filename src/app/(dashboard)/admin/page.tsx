import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Users,
} from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";

const stats = [
  { label: "Total Students", value: "2,480", hint: "Across all departments", icon: Users, trend: "+12%", tone: "violet" as const },
  { label: "Instructors", value: "148", hint: "12 pending approval", icon: BadgeCheck, trend: "+6%", tone: "green" as const },
  { label: "Active Courses", value: "86", hint: "Spring semester", icon: BookOpen, trend: "+4%", tone: "blue" as const },
  { label: "Departments", value: "12", hint: "All faculties", icon: Building2, tone: "amber" as const },
];

const pending = [
  { name: "Dr. Tanvir Ahmed", dept: "Computer Science", time: "2h ago" },
  { name: "Prof. Nusrat Jahan", dept: "Mathematics", time: "5h ago" },
  { name: "Dr. Kamal Hossain", dept: "Physics", time: "1d ago" },
];

const quickLinks = [
  { title: "Approve instructors", href: "/admin/instructor-applications", desc: "Review pending applications" },
  { title: "Manage departments", href: "/admin/departments", desc: "Faculties & departments" },
  { title: "Manage courses", href: "/admin/courses", desc: "Curriculum & semesters" },
];

export default function AdminOverview() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Welcome back, Admin"
        subtitle="Here's what's happening across your university today."
        action={
          <Link
            href="/admin/instructor-applications"
            className="gradient-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-pop transition-opacity hover:opacity-90"
          >
            Review approvals
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <StatCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardPanel
          title="Pending instructor approvals"
          subtitle="Most recent applications"
          className="lg:col-span-3"
          action={
            <Link
              href="/admin/instructor-applications"
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          <ul className="flex flex-col divide-y divide-border">
            {pending.map((p) => (
              <li key={p.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="gradient-brand-soft grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-primary">
                  {p.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.dept}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{p.time}</span>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Quick actions"
          subtitle="Jump to common tasks"
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-2.5">
            {quickLinks.map((q) => (
              <Link
                key={q.title}
                href={q.href}
                className="group flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <span>
                  <span className="block text-sm font-semibold">{q.title}</span>
                  <span className="block text-xs text-muted-foreground">{q.desc}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
