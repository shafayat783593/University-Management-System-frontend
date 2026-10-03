"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Users,
  Wallet,
} from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/hooks";
import FinanceChart from "./finance-chart";

// Task 27: admin dashboard from GET /dashboard/summary.
export default function AdminDashboard() {
  const summary = useDashboardSummary();

  if (summary.isLoading) {
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

  if (summary.isError || !summary.data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load dashboard</p>
        <p className="text-[13px] text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => summary.refetch()}
          className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const data = summary.data;
  const apps = data.instructorApplications;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Dashboard"
        subtitle={
          data.activeSemester
            ? `Active semester: ${data.activeSemester.name} • ${data.enrollment.totalEnrolledThisSemester} enrolled`
            : "No semester is currently OPEN."
        }
        action={
          <Link
            href="/admin/instructor-applications"
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Review approvals ({apps.pending})
          </Link>
        }
      />

      <StatCards
        stats={[
          {
            label: "Students",
            value: String(data.totals.students),
            hint: `${data.enrollment.totalEnrolledThisSemester} enrolled this semester`,
            icon: Users,
            tone: "violet",
          },
          {
            label: "Instructors",
            value: String(data.totals.instructors),
            hint: `${apps.pending} applications pending`,
            icon: BadgeCheck,
            tone: "green",
          },
          {
            label: "Sections",
            value: String(data.totals.sections),
            hint: `${data.totals.courses} courses • ${data.totals.departments} departments`,
            icon: BookOpen,
            tone: "blue",
          },
          {
            label: "Active semester",
            value: data.activeSemester?.name ?? "—",
            hint: `${data.totals.semesters} semesters total`,
            icon: CalendarDays,
            tone: "amber",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardPanel
          title="Finance"
          subtitle="Collected vs pending vs failed/cancelled"
          className="lg:col-span-3"
          action={
            <Link
              href="/admin/payments"
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              View payments
            </Link>
          }
        >
          <FinanceChart
            collected={data.finance.totalCollected}
            pending={data.finance.totalPending}
            failed={data.finance.totalFailedOrCancelled}
          />
          <div className="mt-2 flex flex-wrap gap-4 text-[13px]">
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="size-3.5 text-green-600" />
              Collected: <strong>{data.finance.totalCollected}</strong>
            </span>
            <span>
              Pending: <strong>{data.finance.totalPending}</strong>
            </span>
            <span>
              Failed: <strong>{data.finance.totalFailedOrCancelled}</strong>
            </span>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Instructor applications"
          subtitle="By verification status"
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/instructor-applications"
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              Review
            </Link>
          }
        >
          <ul className="flex flex-col gap-3">
            <li className="flex items-center justify-between text-sm">
              <span className="font-medium">Pending</span>
              <Badge variant="warning">{apps.pending}</Badge>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="font-medium">Approved</span>
              <Badge variant="success">{apps.approved}</Badge>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="font-medium">Rejected</span>
              <Badge variant="destructive">{apps.rejected}</Badge>
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Building2 className="size-4" />
            {data.totals.departments} departments • {data.totals.courses}{" "}
            courses • {data.totals.semesters} semesters
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
