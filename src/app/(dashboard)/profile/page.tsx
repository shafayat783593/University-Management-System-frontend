"use client";

import AuthLoading from "@/components/auth/auth.loading";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import ChangePasswordForm from "@/components/modules/profile/change-password-form";
import ProfileImageForm from "@/components/modules/profile/profile-image-form";
import ProfileInfoCard from "@/components/modules/profile/profile-info-card";
import {
  InstructorInfoCard,
  StudentInfoCard,
  StudentInfoEmpty,
} from "@/components/modules/profile/role-info-cards";
import type { UserRole } from "@/components/types";
import { useGetMe } from "@/hooks";

function shellRole(role: UserRole | undefined): UserRole {
  if (role === "STUDENT" || role === "INSTRUCTOR" || role === "ADMIN") {
    return role;
  }
  return "ADMIN";
}

export default function ProfilePage() {
  const { data, isPending } = useGetMe();
  const user = data?.data;

  if (isPending) return <AuthLoading label="Loading profile…" />;

  const student = user?.role === "STUDENT" ? user?.studentProfile : null;
  const hasStudentInfo =!!student && !!(student.phone || student.address || student.guardianName);

  return (
    <DashboardShell role={shellRole(user?.role)}>
      <div className="flex flex-col gap-4">
        <DashboardPageHeader
          title="My profile"
          subtitle="View your account, update your photo and change your password."
        />
        <ProfileInfoCard />

        {/* Role-wise extra block (PRD §5) */}
        {user?.role === "STUDENT" && student ? (
          hasStudentInfo ? (
            <StudentInfoCard profile={student} />
          ) : (
            <StudentInfoEmpty />
          )
        ) : null}
        {user?.role === "INSTRUCTOR" && user?.instructorProfile ? (
          <InstructorInfoCard profile={user.instructorProfile} />
        ) : null}

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <ProfileImageForm />
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardShell>
  );
}
