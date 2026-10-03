import EnrollmentsBrowser from "@/components/modules/student/enrollments/enrollments-browser";

export const metadata = {
  title: "Browse & Enroll",
  description: "Browse open sections and enroll in courses.",
};

export default function StudentEnrollPage() {
  return <EnrollmentsBrowser />;
}
