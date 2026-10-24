import ProgramDetails from "@/components/modules/student/programs/program-details";

export const metadata = {
  title: "Program Details",
  description: "Courses, instructors, fee, and open sections.",
};

export default async function StudentProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProgramDetails id={id} />;
}
