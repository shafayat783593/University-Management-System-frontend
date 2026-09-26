"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useGetMe, useLogout } from "@/hooks/auth.hook";
import { adminRoutes, instructorRoutes, studentRoutes } from "@/routes";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronsUpDown,
  GraduationCap,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "../types";
import type { SidebarItems } from "../types/sidebar.type";

const sidebarRoutes: Partial<Record<UserRole, SidebarItems>> = {
  ADMIN: adminRoutes,
  STUDENT: studentRoutes,
  INSTRUCTOR: instructorRoutes,
};

const roleMeta: Record<UserRole, { label: string; hint: string }> = {
  ADMIN: { label: "Admin Panel", hint: "Full access" },
  STUDENT: { label: "Student Portal", hint: "Learning space" },
  INSTRUCTOR: { label: "Instructor Hub", hint: "Teaching space" },
  SUPERADMIN: { label: "Super Admin", hint: "Full access" },
};

function isActiveRoute(pathname: string, url: string) {
  if (url === "#") return false;
  if (pathname === url) return true;
  // Keep parent highlighted for nested pages, e.g. /admin/students/123
  return url !== "/" && pathname.startsWith(`${url}/`);
}

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const routes: SidebarItems = sidebarRoutes[role] ?? [];
  const meta = roleMeta[role] ?? roleMeta.ADMIN;

  const { data: me } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const userName =
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.data?.name ??
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.name ??
    "User";
  const userEmail =
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.data?.email ??
    // biome-ignore lint/suspicious/noExplicitAny: API shape varies
    (me as any)?.email ??
    role.toLowerCase();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.push("/login");
      },
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Brand */}
      <SidebarHeader className="gap-0 pb-2">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <span className="gradient-brand grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-pop">
            <GraduationCap className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[15px] font-bold tracking-tight">
              UniManage
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {meta.label}
            </span>
          </span>
        </Link>

        <div className="mx-2 mt-2 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-1.5 group-data-[collapsible=icon]:hidden">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="truncate text-[11px] font-semibold text-sidebar-accent-foreground">
            {meta.hint} · {role}
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      {/* Nav */}
      <SidebarContent className="gap-1 px-2">
        {routes.map((group) => (
          <SidebarGroup key={group.title} className="px-0 py-1">
            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active = isActiveRoute(pathname, item.url);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={active}
                        tooltip={item.title}
                        className={
                          active
                            ? "sidebar-link-active font-semibold"
                            : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                        }
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className="bg-primary/15 text-[10px] font-bold text-primary">
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="px-0 py-1">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
            Quick
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  tooltip="Back to website"
                  className="text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                >
                  <Home />
                  <span>Website</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter className="gap-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-card/60 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <span className="gradient-brand grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
            {String(userName).slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-semibold">
              {userName}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {userEmail}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {isLoggingOut ? "Logging out…" : "Logout"}
          </span>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
