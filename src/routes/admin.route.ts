import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Megaphone,
  Percent,
  Receipt,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import type { SidebarItems } from "@/components/types/sidebar.type";

const prefix = "/admin";

export const adminRoutes: SidebarItems = [
  {
    title: "Management",
    items: [
      { title: "Dashboard", url: `${prefix}/dashboard`, icon: LayoutDashboard },
      {
        title: "Instructor Applications",
        url: `${prefix}/instructor-applications`,
        icon: BadgeCheck,
        badge: "New",
      },
      { title: "Admissions", url: `${prefix}/admissions`, icon: FileCheck2 },
      { title: "Departments", url: `${prefix}/departments`, icon: Building2 },
      { title: "Courses", url: `${prefix}/courses`, icon: BookOpen },
      { title: "Semesters", url: `${prefix}/semesters`, icon: CalendarDays },
      { title: "Sections", url: `${prefix}/sections`, icon: Users },
    ],
  },
  {
    title: "Finance & Results",
    items: [
      { title: "Fee Policies", url: `${prefix}/fee-policies`, icon: ClipboardList },
      { title: "Installment Plans", url: `${prefix}/installment-policies`, icon: CalendarDays },
      { title: "Invoices", url: `${prefix}/invoices`, icon: FileText },
      { title: "Payments", url: `${prefix}/payments`, icon: Receipt },
      { title: "Reports", url: `${prefix}/reports`, icon: ChartColumn },
      { title: "Waivers", url: `${prefix}/waivers`, icon: Percent },
      {
        title: "Publish Results",
        url: `${prefix}/results/publish`,
        icon: ScrollText,
      },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Announcements", url: `${prefix}/announcements`, icon: Megaphone },
      { title: "Audit Logs", url: `${prefix}/audit-logs`, icon: ScrollText },
      { title: "Settings", url: `${prefix}/settings`, icon: Settings },
    ],
  },
];
