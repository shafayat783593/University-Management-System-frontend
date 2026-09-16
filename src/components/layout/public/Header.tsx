"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react"


import { toast } from "@/components/ui/toast"
import { getDashboardHome, getNavForRole, roleLabel } from "./navconfig"
import { ThemeToggle } from "./ThemeToggle"
import { useGetMe, useLogout } from "@/hooks/auth.hook"


type MeUser = {
  _id?: string
  name?: string
  email?: string
  role?: "admin" | "faculty" | "student"
  avatar?: string
  studentId?: string
}

function initials(name?: string) {
  if (!name) return "U"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetMe()
  const { mutate: logout, isPending } = useLogout()

  // Works whether your API returns the user directly or wrapped in { data }.
  const user: MeUser | undefined = (data as any)?.data ?? (data as MeUser | undefined)
  const role = user?.role

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const navItems = getNavForRole(role)

  // Close menus on navigation.
  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Close the profile dropdown on outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [profileOpen])

  const handelLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "logged out",
          description: "Logged Out Successfully",
          type: "success",
        })
        queryClient.removeQueries({ queryKey: ["user"] })
        setProfileOpen(false)
        setMenuOpen(false)
        router.push("/login")
      },
      onError: () => {
        toast.add({
          title: "logged out faile",
          description: "Something went wrong",
          type: "error",
        })
      },
    })
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[15px] font-semibold tracking-tight text-foreground">
              Northfield University
            </span>
            <span className="block text-[11px] text-muted-foreground">Management portal</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <div className="hidden h-9 w-36 animate-pulse rounded-lg bg-muted sm:block" />
          ) : user ? (
            <div ref={profileRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Avatar user={user} />
                <span className="hidden text-left leading-tight md:block">
                  <span className="block max-w-[10rem] truncate text-[13px] font-medium text-foreground">
                    {user.name ?? "Account"}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{roleLabel(role)}</span>
                </span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                >
                  <div className="flex items-center gap-3 border-b border-border p-3">
                    <Avatar user={user} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-popover-foreground">
                        {user.name ?? "Account"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {roleLabel(role)}
                        {user.studentId ? ` · ${user.studentId}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <MenuLink href={getDashboardHome(role)} icon={LayoutDashboard}>
                      Dashboard
                    </MenuLink>
                    <MenuLink href="/profile" icon={User}>
                      My profile
                    </MenuLink>
                  </div>

                  <div className="border-t border-border p-1.5">
                    <button
                      type="button"
                      onClick={handelLogout}
                      disabled={isPending}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <LogOut className="size-4" />
                      {isPending ? "Logging out…" : "Log out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Apply now
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground lg:hidden"
          >
            {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{roleLabel(role)}</p>
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-[18px]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t border-border pt-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <User className="size-[18px]" />
                    My profile
                  </Link>
                  <button
                    type="button"
                    onClick={handelLogout}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                  >
                    <LogOut className="size-[18px]" />
                    {isPending ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg border border-border py-2.5 text-center text-sm font-medium text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground"
                  >
                    Apply now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function Avatar({ user, size = "sm" }: { user: MeUser; size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "size-10 text-sm" : "size-7 text-[11px]"

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className={`${dimension} shrink-0 rounded-lg object-cover`}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={`${dimension} grid shrink-0 place-items-center rounded-lg bg-primary/12 font-semibold text-primary`}
    >
      {initials(user.name)}
    </span>
  )
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
    >
      <Icon className="size-4 text-muted-foreground" />
      {children}
    </Link>
  )
}

// Default export for layouts that import `Header` as default.
// Keep named export `Navbar` for existing named imports.
export default Navbar
export { Navbar as Header }