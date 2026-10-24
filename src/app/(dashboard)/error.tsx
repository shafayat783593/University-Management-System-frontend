"use client";

import Link from "next/link";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/80 bg-card px-6 py-16 text-center shadow-sm">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <p className="text-xs font-bold uppercase tracking-widest text-destructive">Something went wrong</p>
      <h2 className="max-w-md text-xl font-extrabold tracking-tight text-balance">
        This section crashed
      </h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {error.message || "An unexpected error interrupted this page. Your data is safe — try again."}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-95"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-muted"
        >
          <Home className="size-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
