import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import InstructorApprovalManager from "@/components/modules/instructor-approval/instructor-approval-manager";

export default function InstructorApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Instructor applications"
        subtitle="Review pending applications, approve instructors or reject with a reason."
        action={
          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        }
      />

      <InstructorApprovalManager />
    </div>
  );
}
