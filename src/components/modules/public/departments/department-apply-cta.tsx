"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks";

export default function DepartmentApplyCta({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) {
  const { data, isPending } = useAuth();
  const user = data?.data;

  if (isPending) {
    return (
      <span className="inline-flex h-11 items-center rounded-xl bg-muted px-5 text-sm font-semibold text-muted-foreground">
        Loading…
      </span>
    );
  }

  // Not logged in → register first.
  if (!user) {
    return (
      <Link
        href="/register"
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-pop transition-opacity hover:opacity-90"
      >
        Apply Now
        <ArrowRight className="size-4" />
      </Link>
    );
  }

  // Logged in but no studentProfile yet → finish /complete-profile first.
  if (user.role === "STUDENT" && user.studentProfile == null) {
    return (
      <Link
        href={`/complete-profile?departmentId=${encodeURIComponent(departmentId)}`}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-pop transition-opacity hover:opacity-90"
      >
        Apply to this Department
        <ArrowRight className="size-4" />
      </Link>
    );
  }

  // Already enrolled students (or staff) don't get an apply button.
  if (user.role === "STUDENT" && user.studentProfile) {
    return (
      <p className="text-sm font-medium text-muted-foreground">
        You&apos;re already enrolled — manage your courses from{" "}
        <Link
          href="/student/enrollments/my"
          className="font-semibold text-primary hover:underline"
        >
          My Enrollments
        </Link>
        .
      </p>
    );
  }

  return (
    <p className="text-sm font-medium text-muted-foreground">
      {`Browsing ${departmentName} as ${user.role.toLowerCase()}.`}
    </p>
  );
}
