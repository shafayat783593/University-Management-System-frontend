import SectionsManager from "@/components/modules/admin/sections/sections-manager";

export const metadata = {
  title: "Sections",
  description: "Open class sections: course, semester, and instructor.",
};

export default function AdminSectionsPage() {
  return <SectionsManager />;
}
