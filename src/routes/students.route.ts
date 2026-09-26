import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  UserRound,
} from "lucide-react";
import type { SidebarItems } from "@/components/types/sidebar.type";

const prefix = "/student";

export const studentRoutes: SidebarItems = [
  {
    title: "Learning",
    items: [
      { title: "Overview", url: `${prefix}`, icon: LayoutDashboard },
      { title: "My Courses", url: `${prefix}/courses`, icon: BookOpen },
      { title: "Enroll", url: `${prefix}/enroll`, icon: GraduationCap },
      { title: "Results", url: `${prefix}/results`, icon: Trophy },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Payments", url: `${prefix}/payments`, icon: CreditCard },
      { title: "Profile", url: `${prefix}/profile`, icon: UserRound },
    ],
  },
];
