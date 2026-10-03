import CoursesManager from "@/components/modules/admin/courses/courses-manager";

export const metadata = {
  title: "Courses",
  description: "Create courses, set credit hours and prerequisites.",
};

export default function AdminCoursesPage() {
  return <CoursesManager />;
}
