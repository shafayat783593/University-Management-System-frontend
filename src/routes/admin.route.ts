import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  Receipt,
  ScrollText,
  Users,
  Wallet,
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
      { title: "Departments", url: `${prefix}/departments`, icon: Building2 },
      { title: "Courses", url: `${prefix}/courses`, icon: BookOpen },
      { title: "Semesters", url: `${prefix}/semesters`, icon: CalendarDays },
      { title: "Sections", url: `${prefix}/sections`, icon: Users },
    ],
  },
  {
    title: "Finance & Results",
    items: [
      {
        title: "Generate Fees",
        url: `${prefix}/fees/generate`,
        icon: Wallet,
      },
      { title: "Payments", url: `${prefix}/payments`, icon: Receipt },
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
    ],
  },
];
