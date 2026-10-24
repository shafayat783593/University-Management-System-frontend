import FeePoliciesManager from "@/components/modules/admin/fee-policies/fee-policies-manager";

export const metadata = {
  title: "Fee Policies",
  description: "Per-semester charges and installment plans.",
};

export default function AdminFeePoliciesPage() {
  return <FeePoliciesManager />;
}
