import StudentInvoiceDetail from "@/components/modules/student/invoices/student-invoice-detail";

export const metadata = {
  title: "Invoice Detail",
  description: "Installment schedule and payment.",
};

export default async function StudentInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentInvoiceDetail id={id} />;
}
