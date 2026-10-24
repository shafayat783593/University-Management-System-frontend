import BulkCreateExams from "@/components/modules/instructor/exams/bulk-create-exams";

export const metadata = {
  title: "Bulk Create Exams",
  description: "Create exams for several of your sections at once.",
};

export default function InstructorBulkCreatePage() {
  return <BulkCreateExams />;
}
