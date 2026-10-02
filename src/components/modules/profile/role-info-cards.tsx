"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import type { StudentProfileInfo } from "@/components/types";

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
export function InstructorInfoCard({
  profile,
}: {
  profile: Record<string, unknown> | null | undefined;
}) {
  if (!profile) return null;

  const entries = Object.entries(profile).filter(
    ([, v]) => typeof v === "string" && v.length > 0,
  );

  return (
    <DashboardPanel
      title="Instructor info"
      subtitle="Your teaching record (read only)."
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No instructor details to show.
        </p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          {entries.slice(0, 6).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-muted/60 p-3">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {key}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </DashboardPanel>
  );
}
