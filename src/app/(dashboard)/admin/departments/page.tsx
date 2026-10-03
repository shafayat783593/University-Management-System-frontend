import DepartmentsManager from "@/components/modules/admin/departments/departments-manager";

export const metadata = {
  title: "Departments",
  description: "Create, rename, or remove departments.",
};

export default function AdminDepartmentsPage() {
  return <DepartmentsManager />;
}
