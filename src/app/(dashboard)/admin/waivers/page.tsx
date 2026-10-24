import WaiversManager from "@/components/modules/admin/waivers/waivers-manager";

export const metadata = {
  title: "Waivers",
  description: "Apply scholarships, waivers and discounts to unpaid invoices.",
};

export default function AdminWaiversPage() {
  return <WaiversManager />;
}
