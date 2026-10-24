"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, ShieldAlert } from "lucide-react";
import { useGetMe } from "@/hooks";

function dashboardHome(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "INSTRUCTOR") return "/instructor";
  if (role === "STUDENT") return "/student";
  return "/";
}

export default function AccessDenied() {
  const { data } = useGetMe();
  const role = data?.data?.role;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-b from-destructive/5 via-background to-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 text-center shadow-xl"
      >
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg"
        >
          <ShieldAlert className="size-8" />
        </motion.span>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-destructive">403 · Access denied</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">You can&apos;t open this page</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {role
            ? `Your account is signed in as ${role.toLowerCase()}. This area belongs to a different role.`
            : "This area belongs to a different role. Please sign in with the right account."}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={dashboardHome(role)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-95"
          >
            <LayoutDashboard className="size-4" />
            My dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
          >
            <Home className="size-4" />
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
