import MyAttendanceList from "@/components/modules/student/attendance/my-attendance-list";

export const metadata = {
  title: "My Attendance",
  description: "View your attendance grouped by course.",
};

export default function StudentAttendancePage() {
  return <MyAttendanceList />;
}
