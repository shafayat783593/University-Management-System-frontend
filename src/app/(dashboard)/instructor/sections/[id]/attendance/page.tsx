import SectionAttendance from "@/components/modules/instructor/attendance/section-attendance";

export const metadata = {
  title: "Section Attendance",
  description: "Create sessions and mark attendance.",
};

export default async function SectionAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;
  return <SectionAttendance sectionId={id} />;
}
