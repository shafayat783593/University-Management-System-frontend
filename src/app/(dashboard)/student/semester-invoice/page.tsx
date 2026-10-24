import SemesterInvoiceGenerator from "@/components/modules/student/invoices/semester-invoice-generator";

export const metadata = {
  title: "Semester Invoice",
  description: "Generate your semester invoice for enrolled courses.",
};

export default function SemesterInvoicePage() {
  return <SemesterInvoiceGenerator />;
}
