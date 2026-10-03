import SectionResultView from "@/components/modules/student/results/section-result-view";

export const metadata = {
  title: "Result Sheet",
  description: "Your result sheet for one section.",
};

export default async function SectionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionResultView sectionId={id} />;
}
