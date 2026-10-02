"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import AuthLoading from "./auth.loading";
import { useGetMe } from "@/hooks";


export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data, isPending, isError } = useGetMe();

  const user = data?.data;

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (isError || !user) {
      router.replace("/login");
      return;
    }
    // First-login instructors must change the temp password before going anywhere else.
    if (user.needPasswordChange && pathname !== "/profile") {
      router.replace("/profile");
    }
  }, [isPending, isError, user, pathname]);

  if (isPending) {
    return <AuthLoading/>;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
    }
    

  return <>{children}</>;
}