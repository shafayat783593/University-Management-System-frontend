import StudentInvoicesList from "@/components/modules/student/invoices/student-invoices-list";

export const metadata = {
  title: "My Fees",
  description: "Invoices with installment schedule — pay with bKash.",
};

export default function StudentMyFeesPage() {
  return <StudentInvoicesList title="My fees" />;
}
