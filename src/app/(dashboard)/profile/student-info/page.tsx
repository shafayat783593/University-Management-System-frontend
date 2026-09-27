"use client";

import RoleGuard from "@/components/auth/role.guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import StudentInfoForm from "@/components/modules/profile/student-info-form";

export default function StudentInfoPage() {
  return (
    <RoleGuard roles={["STUDENT"]}>
      <DashboardShell role="STUDENT">
        <div className="flex flex-col gap-4">
          <DashboardPageHeader
            title="Extra information"
            subtitle="Optional details for your student record — nothing here is required."
          />
          <StudentInfoForm />
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
