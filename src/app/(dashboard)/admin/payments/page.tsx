import PaymentsManager from "@/components/modules/admin/payments/payments-manager";

export const metadata = {
  title: "Payments",
  description: "View all student payments with filters.",
};

export default function AdminPaymentsPage() {
  return <PaymentsManager />;
}
