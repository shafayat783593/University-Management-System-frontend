"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import StudentInfoForm from "@/components/modules/profile/student-info-form";

export default function StudentInfoPage() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        title="Additional info"
        subtitle="Optional details for your student record — nothing here is required."
      />
      <StudentInfoForm />
    </div>
  );
}
