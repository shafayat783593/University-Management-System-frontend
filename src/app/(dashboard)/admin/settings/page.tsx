import SettingsManager from "@/components/modules/admin/settings/settings-manager";

export const metadata = {
  title: "Settings",
  description: "Admission and fee gates for the whole university.",
};

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
