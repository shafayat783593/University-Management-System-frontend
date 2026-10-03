import AnnouncementsManager from "@/components/modules/admin/announcements/announcements-manager";

export const metadata = {
  title: "Announcements",
  description: "Create and manage university announcements.",
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager />;
}
