import StudentPaymentsHistory from "@/components/modules/student/payments/payments-history";

export const metadata = {
  title: "Payments",
  description: "Payment history and receipt downloads.",
};

export default function StudentPaymentsPage() {
  return <StudentPaymentsHistory />;
}
