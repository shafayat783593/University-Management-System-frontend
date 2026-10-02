import { BookOpen, LayoutDashboard } from "lucide-react";
import type { SidebarItems } from "@/components/types/sidebar.type";

const prefix = "/instructor";

export const instructorRoutes: SidebarItems = [
  {
    title: "Teaching",
    items: [
      { title: "Overview", url: `${prefix}`, icon: LayoutDashboard },
      { title: "My Sections", url: `${prefix}/sections`, icon: BookOpen },
    ],
  },
];
