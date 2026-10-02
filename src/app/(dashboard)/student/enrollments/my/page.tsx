import MyEnrollmentsList from "@/components/modules/enrollments/my-enrollments-list";

export const metadata = {
  title: "My Enrollments",
  description: "View, drop, or withdraw from your enrolled sections.",
};

export default function StudentMyEnrollmentsPage() {
  return <MyEnrollmentsList />;
}
