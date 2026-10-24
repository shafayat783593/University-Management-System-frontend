import StudentInvoicesList from "@/components/modules/student/invoices/student-invoices-list";

export const metadata = {
  title: "My Invoices",
  description: "Every charge, installment by installment.",
};

export default function StudentInvoicesPage() {
  return <StudentInvoicesList />;
}
