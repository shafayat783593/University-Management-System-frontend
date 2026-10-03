import SemestersManager from "@/components/modules/admin/semesters/semesters-manager";

export const metadata = {
  title: "Semesters",
  description: "Create semesters and change their status.",
};

export default function AdminSemestersPage() {
  return <SemestersManager />;
}
