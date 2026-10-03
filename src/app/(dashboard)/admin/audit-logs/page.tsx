import AuditLogsManager from "@/components/modules/admin/audit-logs/audit-logs-manager";

export const metadata = {
  title: "Audit Logs",
  description: "See who changed what, and when.",
};

export default function AdminAuditLogsPage() {
  return <AuditLogsManager />;
}
