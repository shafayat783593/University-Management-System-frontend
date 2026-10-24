import { Suspense } from "react";
import AuthLoading from "@/components/auth/auth.loading";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ApplyForm from "@/components/modules/student/apply/apply-form";

export const metadata = {
  title: "Complete Profile",
  description: "Pick your department and phone to finish setting up your student account.",
};

export default function CompleteProfilePage() {
  return (
    <DashboardShell role="STUDENT">
      <Suspense fallback={<AuthLoading label="Loading…" />}>
        <ApplyForm />
      </Suspense>
    </DashboardShell>
  );
}
