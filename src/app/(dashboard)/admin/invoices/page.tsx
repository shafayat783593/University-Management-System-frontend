import AdminInvoicesManager from "@/components/modules/admin/invoices/invoices-manager";

export const metadata = {
  title: "Invoices",
  description: "Filter, adjust, cancel and bulk-generate invoices.",
};

export default function AdminInvoicesPage() {
  return <AdminInvoicesManager />;
}
