"use client";

import { BadgeCheck, CircleAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { useMyFees } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

// After bKash redirects back here, re-fetch my-fees and show latest status.
export default function PaymentResultView() {
  const query = useMyFees();
  const fees = query.data ?? [];

  const paid = fees.filter((f) => f.status === "PAID").length;
  const partial = fees.filter((f) => f.status === "PARTIALLY_PAID").length;
  const pending = fees.filter((f) => f.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Payment result"
        subtitle="Latest fee status after your bKash payment."
        action={
          <Link
            href="/student/payments/my-fees"
            className="inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Back to my fees
          </Link>
        }
      />

      {query.isLoading ? (
        <DashboardPanel title="Checking…">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Refreshing your payment status…
          </p>
        </DashboardPanel>
      ) : query.isError ? (
        <DashboardPanel title="Could not check status">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(query.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-3 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </DashboardPanel>
      ) : (
        <DashboardPanel title="Current status">
          <p className="flex items-center gap-2 text-sm">
            <BadgeCheck className="size-4 text-success" />
            {paid} paid · {partial} partially paid
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm">
            <CircleAlert className="size-4 text-warning" />
            {pending} still pending
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {fees.map((fee) => (
              <li
                key={fee.id}
                className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {fee.type === "ADMISSION" ? "Admission" : (fee.semester?.name ?? "Tuition")} · ৳
                  {fee.paidAmount.toLocaleString()}/৳{fee.amount.toLocaleString()}
                </span>
                <span className="font-bold text-muted-foreground">
                  {fee.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      )}
    </div>
  );
}
