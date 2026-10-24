import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  Receipt,
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
      { title: "Programs", url: `${prefix}/programs`, icon: BookOpen },
      {
        title: "Admission Application",
        url: `${prefix}/admission-application`,
        icon: FileText,
      },
      { title: "Enrollments", url: `${prefix}/enrollments`, icon: BookOpen },
      {
        title: "My Enrollments",
        url: `${prefix}/enrollments/my`,
        icon: GraduationCap,
      },
      { title: "Attendance", url: `${prefix}/attendance`, icon: CalendarCheck },
      { title: "All Results", url: `${prefix}/results/my`, icon: Trophy },
      {
        title: "Transcript",
        url: `${prefix}/results/transcript`,
        icon: Trophy,
      },
      { title: "Class Routine", url: `${prefix}/routine`, icon: CalendarDays },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "My Fees", url: `${prefix}/payments/my-fees`, icon: CreditCard },
      { title: "Invoices", url: `${prefix}/invoices`, icon: FileText },
      { title: "Payments", url: `${prefix}/payments`, icon: Receipt },
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
