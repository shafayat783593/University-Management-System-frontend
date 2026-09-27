"use client";

import Image from "next/image";
import { BadgeCheck, Mail, ShieldCheck } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/hooks";

function initials(name?: string) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileInfoCard() {
  const { data, isPending, isError, refetch, isRefetching } = useGetMe();
  const user = data?.data;

  if (isPending) {
    return (
      <DashboardPanel title="Profile" subtitle="Loading your information…">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </DashboardPanel>
    );
  }

  if (isError) {
    return (
      <DashboardPanel title="Profile" subtitle="We couldn't load your information.">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-semibold">Could not load profile</p>
          <p className="text-[13px] text-muted-foreground">
            Check your connection, then retry.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {isRefetching ? "Retrying…" : "Retry"}
          </button>
        </div>
      </DashboardPanel>
    );
  }

  if (!user) {
    return (
      <DashboardPanel title="Profile" subtitle="No profile found.">
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-semibold">No profile data</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
            Your account information is currently unavailable.
          </p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title="Profile"
      subtitle="Your current account information."
      action={
        <Badge variant="secondary" className="capitalize">
          {user.role.toLowerCase()}
        </Badge>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={`${user.name}'s profile photo`}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="gradient-brand grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white"
          >
            {initials(user.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight">{user.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            {user.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success">
                <BadgeCheck className="size-3.5" />
                Email verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                Email not verified
              </span>
            )}
            {user.needPasswordChange ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                <ShieldCheck className="size-3.5" />
                Password change required
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
