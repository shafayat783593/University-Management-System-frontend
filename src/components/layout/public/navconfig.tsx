

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

export type Role = "admin" | "instructor" | "student"

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
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
}

/** Top-level links per role. Keep this to 5–6 items; the rest lives in the sidebar. */
export const roleNav: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Semesters", href: "/admin/semesters", icon: CalendarDays },
    { label: "Sections", href: "/admin/sections", icon: Users },
    { label: "Applications", href: "/admin/instructor-applications", icon: UserCog },
  ],
  instructor: [
    { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { label: "My Sections", href: "/instructor/sections", icon: BookOpen },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Enrollments", href: "/student/enrollments", icon: BookOpen },
    { label: "My Enrollments", href: "/student/enrollments/my", icon: ClipboardList },
    { label: "Transcript", href: "/student/results/transcript", icon: FileBarChart },
    { label: "My Fees", href: "/student/payments/my-fees", icon: CreditCard },
  ],
}

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "instructor" || value === "student"
}

export function getNavForRole(role?: string | null): NavItem[] {
  return isRole(role) ? roleNav[role] : publicNav
}

export function getDashboardHome(role?: string | null): string {
  return isRole(role) ? dashboardHome[role] : "/login"
}

export function roleLabel(role?: string | null): string {
 
  if (role === "admin") return "Administrator"
  if (role === "instructor") return "Instructor"
  if (role === "student") return "Student"
  return "Guest"
}