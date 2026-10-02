import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  IdCard,
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
      { title: "Enrollments", url: `${prefix}/enrollments`, icon: BookOpen },
      {
        title: "My Enrollments",
        url: `${prefix}/enrollments/my`,
        icon: GraduationCap,
      },
      { title: "Attendance", url: `${prefix}/attendance`, icon: CalendarCheck },
      { title: "Transcript", url: `${prefix}/results/transcript`, icon: Trophy },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "My Fees", url: `${prefix}/payments/my-fees`, icon: CreditCard },
      { title: "ID Card", url: `${prefix}/id-card`, icon: IdCard },
      { title: "Profile", url: "/profile", icon: UserRound },
      {
        title: "Additional Info",
        url: `${prefix}/profile-info`,
        icon: UserRound,
      },
    ],
  },
];
