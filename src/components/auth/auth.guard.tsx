"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import AuthLoading from "./auth.loading";
import { AdmissionGate, PasswordGate, ProfileGate } from "./account-gates";
import { useGetMe, useMyAdmissionApplication } from "@/hooks";

// Pages a locked account may still visit to unlock itself.
function isUnlockPath(pathname: string) {
  return (
    pathname === "/profile" ||
    pathname === "/logout" ||
    pathname === "/complete-profile" ||
    pathname === "/apply" ||
    pathname === "/student/admission-application" ||
    pathname.startsWith("/student/admission-application/")
  );
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const meQuery = useGetMe();
  const user = meQuery.data?.data;

  // Only students need the admission check — skip the call for everyone else.
  const needsAdmissionCheck =
    !!user && user.role === "STUDENT" && user.studentProfile != null;
  const admissionQuery = useMyAdmissionApplication(needsAdmissionCheck);
  // `application === null` = never submitted. Error = unknown → don't lock.
  const missingAdmission =
    needsAdmissionCheck &&
    !admissionQuery.isPending &&
    !admissionQuery.isError &&
    (admissionQuery.data === null || admissionQuery.data?.application == null);

  const loading = meQuery.isPending || (needsAdmissionCheck && admissionQuery.isPending);
  const loggedOut = !loading && (meQuery.isError || !user);

  useEffect(() => {
    if (loggedOut) router.replace("/login");
  }, [loggedOut, router]);

  if (loggedOut) {
    return <AuthLoading label="Redirecting to login…" />;
  }

  if (loading || !user) {
    return <AuthLoading />;
  }

  // 1. Temporary password must go first — blocks everything but /profile.
  if (user.needPasswordChange && pathname !== "/profile" && pathname !== "/logout") {
    return <PasswordGate />;
  }

  // 2. STUDENT with no studentProfile → must finish /complete-profile once.
  if (
    user.role === "STUDENT" &&
    user.studentProfile == null &&
    pathname !== "/complete-profile" &&
    pathname !== "/apply" &&
    pathname !== "/profile" &&
    pathname !== "/logout"
  ) {
    return <ProfileGate />;
  }

  // 3. No admission application → dashboard stays locked.
  if (user.role === "STUDENT" && missingAdmission && !isUnlockPath(pathname)) {
    return <AdmissionGate />;
  }

  return <>{children}</>;
}
