import {
  BadgeCheck,
  BookOpen,
  Building2,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { SidebarItems } from "@/components/types/sidebar.type";

const prefix = "/admin";

export const adminRoutes: SidebarItems = [
  {
    title: "Management",
    items: [
      { title: "Overview", url: `${prefix}`, icon: LayoutDashboard },
      { title: "Students", url: `${prefix}/students`, icon: Users },
      {
        title: "Instructors",
        url: `${prefix}/approved-instructor`,
        icon: BadgeCheck,
        badge: "New",
      },
      { title: "Departments", url: `${prefix}/departments`, icon: Building2 },
      { title: "Courses", url: `${prefix}/courses`, icon: BookOpen },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", url: `${prefix}/settings`, icon: Settings }],
  },
];
