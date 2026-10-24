import InstallmentPoliciesManager from "@/components/modules/admin/fee-policies/installment-policies-manager";

export const metadata = {
  title: "Installment Plans",
  description: "Monthly installment plans per semester.",
};

export default function AdminInstallmentPoliciesPage() {
  return <InstallmentPoliciesManager />;
}
