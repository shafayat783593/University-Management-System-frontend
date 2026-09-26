"use client";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/public/ThemeToggle";
import { useGetMe } from "@/hooks/auth.hook";
import { Bell, ChevronRight, House, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { UserRole } from "../types";
import { DashboardSidebar } from "./dashboard-sidebar";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <Link
        href="/"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <House className="size-4" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((seg, i) => {
        const href = `/${segments.slice(0, i + 1).join("/")}`;
        const isLast = i === segments.length - 1;
        const label = seg
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return (
          <span key={href} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            {isLast ? (
              <span className="truncate font-semibold text-foreground">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hidden truncate text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role: UserRole;
}) {
  const { data: me } = useGetMe();
  const userName =
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.data?.name ??
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.name ??
    role.charAt(0) + role.slice(1).toLowerCase();

  return (
    <SidebarProvider>
      <DashboardSidebar role={role} />
      <SidebarInset className="dashboard-bg">
        {/* Topbar */}
        <header className="glass sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4 sm:gap-3 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1">
            <Breadcrumbs />
          </div>

          {/* Search */}
          <label className="relative hidden w-64 lg:block xl:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses, students…"
              className="h-9 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground xl:block">
              ⌘K
            </kbd>
          </label>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-[17px]" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive ring-2 ring-card" />
          </button>

          {/* <ThemeToggle /> */}

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <div className="hidden items-center gap-2.5 sm:flex">
            <span className="gradient-brand grid size-9 place-items-center rounded-full text-xs font-bold text-white shadow-soft">
              {String(userName).slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden flex-col leading-tight xl:flex">
              <span className="max-w-28 truncate text-[13px] font-semibold">
                {userName}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground capitalize">
                {role.toLowerCase()}
              </span>
            </span>
          </div>
        </header>

        {/* Page body */}
        <div className="flex flex-1 flex-col">
          <main className="mx-auto w-full max-w-7xl flex-1 animate-slide-up px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-border/60 px-6 py-4">
            <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
              UniManage · University Management System — crafted for admins,
              instructors & students.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
