"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInitPayment,
  useMyAdmissionApplication,
  useMyInvoiceSummary,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { formatBDT, formatDueDate } from "@/lib/format";

// Task 11 — landing page after login: admission + dues summary.
// Data: GET /admission-applications/me + GET /invoices/my/summary.
export default function StudentOverview() {
  const router = useRouter();
  const admissionQuery = useMyAdmissionApplication();
  const summaryQuery = useMyInvoiceSummary();
  const pay = useInitPayment();

  const loading = admissionQuery.isLoading || summaryQuery.isLoading;
  const failed = admissionQuery.isError || summaryQuery.isError;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (failed) {
    const msg = getApiErrorMessage(
      admissionQuery.error ?? summaryQuery.error,
      "Could not load your dashboard.",
    );
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load dashboard</p>
        <p className="text-[13px] text-muted-foreground">{msg}</p>
        <button
          type="button"
          onClick={() => {
            void admissionQuery.refetch();
            void summaryQuery.refetch();
          }}
          className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const mine = admissionQuery.data ?? null;
  const app = mine?.application ?? null;
  const summary = summaryQuery.data;
  const next = summary?.nextInstallment ?? null;
  const overdue = summary?.overdueInstallments ?? [];

  // Primary call-to-action changes with state.
  const cta = !app
    ? { href: "/student/admission-application", label: "Apply now" }
    : !mine?.admissionConfirmed
      ? { href: "/student/payments/my-fees", label: "Pay admission fee" }
      : (summary?.outstandingBalance ?? 0) > 0
        ? { href: "/student/payments/my-fees", label: "Pay installment" }
        : { href: "/student/enrollments", label: "Enroll in courses" };

  function handlePayNext() {
    if (!next) return;
    pay.mutate(
      { invoiceId: next.invoiceId },
      {
        onSuccess: (data) => {
          if (!data?.bkashURL) {
            toast.error("The payment gateway did not return a bKash URL.");
            return;
          }
          // The dashboard lives at /student — there is no /student/dashboard.
          sessionStorage.setItem("payReturnTo", "/student");
          window.location.href = data.bkashURL;
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Could not start payment.")),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Student dashboard"
        subtitle="Admission status and dues at a glance."
        action={
          <Link
            href={cta.href}
            className="gradient-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-pop transition-opacity hover:opacity-90"
          >
            {cta.label}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <DashboardPanel
          title="Admission"
          subtitle="Live from your admission file"
          action={
            app ? (
              <Badge
                variant={
                  app.status === "APPROVED"
                    ? "success"
                    : app.status === "REJECTED"
                      ? "destructive"
                      : "warning"
                }
              >
                {app.status}
              </Badge>
            ) : null
          }
        >
          {!app ? (
            <p className="text-sm text-muted-foreground">
              Not applied yet.{" "}
              <Link
                href="/student/admission-application"
                className="font-semibold text-primary hover:underline"
              >
                Start application →
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              {mine?.studentIdCode ? (
                <p>
                  Student ID: <strong>{mine.studentIdCode}</strong>
                </p>
              ) : (
                <p>
                  <Badge variant="warning">
                    Pending admission confirmation
                  </Badge>
                </p>
              )}
              {app.status === "REJECTED" ? (
                <p className="text-[13px]">
                  Reason: {app.rejectionReason ?? "Contact the office."}
                </p>
              ) : null}
              {mine?.admissionConfirmed ? (
                <p className="font-semibold text-success">
                  Admission confirmed — you can enroll now.
                </p>
              ) : app.status === "APPROVED" ? (
                <p>
                  Approved — pay the admission fee.{" "}
                  <Link
                    href="/student/payments/my-fees"
                    className="font-semibold text-primary hover:underline"
                  >
                    Go to my fees
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Submitted — waiting for review.
                </p>
              )}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Dues summary"
          subtitle="Server totals — never computed here"
        >
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-[11px] text-muted-foreground">Total fees</dt>
              <dd className="mt-0.5 font-bold tabular-nums">
                {formatBDT(summary?.totalFees ?? 0)}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-[11px] text-muted-foreground">Paid</dt>
              <dd className="mt-0.5 font-bold tabular-nums text-success">
                {formatBDT(summary?.totalPaid ?? 0)}
              </dd>
            </div>
            <div className="rounded-xl bg-destructive/[0.07] p-3">
              <dt className="text-[11px] text-muted-foreground">Outstanding</dt>
              <dd className="mt-0.5 font-bold tabular-nums text-destructive">
                {formatBDT(summary?.outstandingBalance ?? 0)}
              </dd>
            </div>
          </dl>
          <div className="mt-3">
            {next ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                <span>
                  Next: <strong>{formatBDT(next.remaining)}</strong> by{" "}
                  <strong>{formatDueDate(next.dueDate)}</strong>
                </span>
                <Button
                  size="sm"
                  disabled={pay.isPending}
                  onClick={handlePayNext}
                >
                  {pay.isPending ? "Starting…" : "Pay"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending installment.
              </p>
            )}
          </div>
        </DashboardPanel>
      </div>

      {overdue.length > 0 ? (
        <DashboardPanel
          title="Overdue"
          subtitle="Pay these first — viewing results is blocked until clear"
        >
          <ul className="flex flex-col gap-2">
            {overdue.map((o) => (
              <li
                key={o.installmentId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm"
              >
                <span className="font-semibold text-destructive">
                  Installment {o.number} · {formatBDT(o.remaining)} · due{" "}
                  {formatDueDate(o.dueDate)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/student/payments/my-fees")}
                >
                  Pay now
                </Button>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
