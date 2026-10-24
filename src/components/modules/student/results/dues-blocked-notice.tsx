"use client";

import Link from "next/link";
import { FetchError } from "ofetch";
import { getApiErrorMessage } from "@/lib/apiClient";

// §10 — results/transcript/ID-card answer 403 while an installment is
// overdue. Pay/drop/withdraw stay open; only viewing is blocked.
/** True when this error is the overdue-dues gate (not a generic failure). */
export function isDuesBlocked(error: unknown): boolean {
  if (!(error instanceof FetchError) || error.status !== 403) return false;
  const message = String(
    (error.data as { message?: unknown } | undefined)?.message ?? "",
  ).toLowerCase();
  return message.includes("overdue") || message.includes("dues");
}

/** Empty state for blocked pages — points at payment, not a retry loop. */
export function DuesBlockedNotice({ error }: { error: unknown }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
      <p className="text-sm font-semibold">Blocked by overdue dues</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">
        {getApiErrorMessage(error, "Clear your overdue installments to view this page.")}
      </p>
      <Link
        href="/student/payments/my-fees"
        className="mt-1 inline-flex h-8 items-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground"
      >
        Pay my dues →
      </Link>
    </div>
  );
}
