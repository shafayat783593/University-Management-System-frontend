import AdmissionReviewList from "@/components/modules/admin/admissions/admission-review-list";

export const metadata = {
  title: "Admission Applications",
  description: "Review and approve student admission applications.",
};

export default function AdminAdmissionsPage() {
  return <AdmissionReviewList />;
}
