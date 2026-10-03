"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import type { InstructorProfileInfo, StudentProfileInfo } from "@/components/types";
import { useAuth, useDepartments } from "@/hooks";

// Shows saved student contact info on /profile (read only).
// Edit lives at /student/profile-info.
export function StudentInfoCard({
  profile,
}: {
  profile: StudentProfileInfo;
}) {
  const rows = [
    { label: "Student ID", value: profile.studentIdCode },
    { label: "Phone", value: profile.phone },
    { label: "Address", value: profile.address },
    { label: "Guardian", value: profile.guardianName },
  ].filter((r) => r.value);

  return (
    <DashboardPanel
      title="Student info"
      subtitle="Your saved contact details."
      action={
        <Link
          href="/student/profile-info"
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Edit
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl bg-muted/60 p-3">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {r.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </DashboardPanel>
  );
}

// Empty state when a student has not filled anything yet.
export function StudentInfoEmpty() {
  return (
    <DashboardPanel
      title="Student info"
      subtitle="Add your contact and guardian information."
    >
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-5" />
        </span>
        <p className="text-sm font-semibold">No extra info yet</p>
        <p className="max-w-sm text-[13px] text-muted-foreground">
          Save your phone, address and guardian details so the office can reach
          you.
        </p>
        <Link
          href="/student/profile-info"
          className="mt-2 inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Add your contact and guardian information
        </Link>
      </div>
    </DashboardPanel>
  );
}

// Instructors have no edit endpoint yet — display only.
// Shows names (department, user) instead of raw IDs.
export function InstructorInfoCard({
  profile,
}: {
  profile: InstructorProfileInfo | null | undefined;
}) {
  const { data: me } = useAuth();
  const departments = useDepartments(1).data?.items ?? [];

  if (!profile) return null;

  const department = departments.find((d) => d.id === profile.departmentId);
  const user = me?.data;

  const rows = [
    { label: "Name", value: user?.name },
    { label: "Email", value: user?.email },
    {
      label: "Department",
      value: department
        ? `${department.name} (${department.code})`
        : "Loading…",
    },
    { label: "Qualification", value: profile.qualification },
  ].filter((r) => r.value);

  return (
    <DashboardPanel
      title="Instructor info"
      subtitle="Your teaching record (read only)."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-muted/60 p-3">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {r.label}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold">{r.value}</dd>
          </div>
        ))}
        {profile.verificationStatus ? (
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  profile.verificationStatus === "APPROVED"
                    ? "success"
                    : profile.verificationStatus === "PENDING"
                      ? "warning"
                      : "destructive"
                }
              >
                {profile.verificationStatus}
              </Badge>
            </dd>
          </div>
        ) : null}
      </dl>
    </DashboardPanel>
  );
}
