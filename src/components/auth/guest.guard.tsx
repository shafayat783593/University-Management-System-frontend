"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import AuthLoading from "./auth.loading";
import { useGetMe } from "@/hooks";

function dashboardForRole(role?: string) {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "INSTRUCTOR":
      return "/instructor";
    case "ADMIN":
    case "SUPERADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export default function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending || !user) return;
    router.replace(dashboardForRole(user.role));
  }, [isPending, user, router]);

  if (isPending) {
    return <AuthLoading label="Checking session" />;
  }

  if (user) {
    return <AuthLoading label="Redirecting to dashboard…" />;
  }

  return <>{children}</>;
}