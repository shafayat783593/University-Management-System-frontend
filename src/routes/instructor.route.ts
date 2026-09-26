import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
  Users,
  UserRound,
} from "lucide-react";
import type { SidebarItems } from "@/components/types/sidebar.type";

const prefix = "/instructor";

export const instructorRoutes: SidebarItems = [
  {
    title: "Teaching",
    items: [
      { title: "Overview", url: `${prefix}`, icon: LayoutDashboard },
      { title: "My Courses", url: `${prefix}/courses`, icon: BookOpen },
      {
        title: "Create Course",
        url: `${prefix}/courses/new`,
        icon: PlusCircle,
      },
      { title: "Students", url: `${prefix}/students`, icon: Users },
    ],
  },
  {
    title: "Schedule",
    items: [
      { title: "Class Schedule", url: `${prefix}/schedule`, icon: CalendarDays },
      { title: "Profile", url: `${prefix}/profile`, icon: UserRound },
    ],
  },
];
