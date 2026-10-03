import SectionExams from "@/components/modules/instructor/exams/section-exams";

export const metadata = {
  title: "Section Exams",
  description: "Create exams and submit results.",
};

export default async function SectionExamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionExams sectionId={id} />;
}
