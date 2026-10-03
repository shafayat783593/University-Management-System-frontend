import RoleGuard from "@/components/auth/role.guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <DashboardShell role="INSTRUCTOR">
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}


 