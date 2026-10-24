"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllDepartment } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";


export default function ProgramsList() {
  const query = useGetAllDepartment();
  const departments = query.data ?? [];

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Programs"
          subtitle="Choose a department to see its courses and open sections."
        />
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="rounded-2xl border bg-card p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-full" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Programs"
          subtitle="Choose a department to see its courses and open sections."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load departments</p>
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
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Programs"
          subtitle="Choose a department to see its courses and open sections."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-5" />
          </span>
          <p className="text-sm font-semibold">No departments yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Departments appear here once an admin creates them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Programs"
        subtitle="Choose a department to see its courses and open sections."
      />

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept) => (
          <li
            key={dept.id}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft"
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-primary">
              <Building2 className="size-3.5" />
              {dept.code}
            </span>
            <div>
              <h3 className="text-[15px] font-bold">{dept.name}</h3>
              {dept.description ? (
                <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                  {dept.description}
                </p>
              ) : null}
            </div>
            {dept._count ? (
              <p className="text-xs text-muted-foreground">
                {dept._count.courses ?? 0} courses ·{" "}
                {dept._count.instructors ?? 0} instructors ·{" "}
                {dept._count.students ?? 0} students
              </p>
            ) : null}
            <Link
              href={`/student/programs/${dept.id}`}
              className="mt-auto inline-flex h-9 w-fit items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              View details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
