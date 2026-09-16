

import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  UserCog,
  Users,
} from "lucide-react"

export type Role = "admin" | "faculty" | "student"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/** Shown when nobody is logged in. */
export const publicNav: NavItem[] = [
  { label: "Programs", href: "/programs", icon: GraduationCap },
  { label: "Admissions", href: "/admissions", icon: ClipboardList },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Library", href: "/library", icon: Library },
]

/** Where each role lands right after login. */
export const dashboardHome: Record<Role, string> = {
  admin: "/dashboard/admin",
  faculty: "/dashboard/faculty",
  student: "/dashboard/student",
}

/** Top-level links per role. Keep this to 5–6 items; the rest lives in the sidebar. */
export const roleNav: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/admin/students", icon: Users },
    { label: "Faculty", href: "/dashboard/admin/faculty", icon: UserCog },
    { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "Semesters", href: "/dashboard/admin/semesters", icon: CalendarDays },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  faculty: [
    { label: "Dashboard", href: "/dashboard/faculty", icon: LayoutDashboard },
    { label: "My courses", href: "/dashboard/faculty/courses", icon: BookOpen },
    { label: "Schedule", href: "/dashboard/faculty/schedule", icon: CalendarDays },
    { label: "Grading", href: "/dashboard/faculty/grades", icon: FileBarChart },
    { label: "My students", href: "/dashboard/faculty/students", icon: Users },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Registration", href: "/dashboard/student/registration", icon: ClipboardList },
    { label: "My courses", href: "/dashboard/student/courses", icon: BookOpen },
    { label: "Results", href: "/dashboard/student/results", icon: FileBarChart },
    { label: "Payments", href: "/dashboard/student/payments", icon: CreditCard },
  ],
}

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "faculty" || value === "student"
}

export function getNavForRole(role?: string | null): NavItem[] {
  return isRole(role) ? roleNav[role] : publicNav
}

export function getDashboardHome(role?: string | null): string {
  return isRole(role) ? dashboardHome[role] : "/login"
}

export function roleLabel(role?: string | null): string {
  if (role === "admin") return "Administrator"
  if (role === "faculty") return "Faculty"
  if (role === "student") return "Student"
  return "Guest"
}