import { Suspense } from "react";
import AuthLoading from "@/components/auth/auth.loading";
import AdmissionApplicationForm from "@/components/modules/student/admission/admission-application-form";

export const metadata = {
  title: "Admission Application",
  description: "Submit your admission application to unlock enrollment.",
};

export default function StudentAdmissionApplicationPage() {
  return (
    <Suspense fallback={<AuthLoading label="Loading…" />}>
      <AdmissionApplicationForm />
    </Suspense>
  );
}
