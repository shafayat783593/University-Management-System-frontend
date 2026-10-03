import FeesGenerateForm from "@/components/modules/admin/fees/fees-generate-form";

export const metadata = {
  title: "Generate Fees",
  description: "Generate semester fees for all active students.",
};

export default function AdminFeesGeneratePage() {
  return <FeesGenerateForm />;
}
