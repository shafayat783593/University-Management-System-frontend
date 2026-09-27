"use client";

import AuthLoading from "@/components/auth/auth.loading";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import ChangePasswordForm from "@/components/modules/profile/change-password-form";
import ProfileImageForm from "@/components/modules/profile/profile-image-form";
import ProfileInfoCard from "@/components/modules/profile/profile-info-card";
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

  return (
    <DashboardShell role={shellRole(user?.role)}>
      <div className="flex flex-col gap-4">
        <DashboardPageHeader
          title="My profile"
          subtitle="View your account, update your photo and change your password."
        />
        <ProfileInfoCard />
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <ProfileImageForm />
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardShell>
  );
}
