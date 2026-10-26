"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, GraduationCap, ReceiptText, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
  StatCards,
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

const ease = [0.21, 1.02, 0.73, 1] as const;

export default function StudentOverview() {
  const router = useRouter();
  const reduce = useReducedMotion();
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
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
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
          sessionStorage.setItem("payReturnTo", "/student");
          window.location.href = data.bkashURL;
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Could not start payment.")),
      },
    );
  }

  const container: Variants | undefined = reduce
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item: Variants | undefined = reduce
    ? undefined
    : {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
      };

  const stats = [
    {
      label: "Total fees",
      value: formatBDT(summary?.totalFees ?? 0),
      hint: "Invoiced to date",
      icon: Wallet,
      tone: "violet" as const,
    },
    {
      label: "Paid",
      value: formatBDT(summary?.totalPaid ?? 0),
      hint: "Confirmed payments",
      icon: GraduationCap,
      tone: "green" as const,
    },
    {
      label: "Outstanding",
      value: formatBDT(summary?.outstandingBalance ?? 0),
      hint:
        (summary?.outstandingBalance ?? 0) > 0
          ? "Needs attention"
          : "All clear",
      icon: ReceiptText,
      tone: "amber" as const,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "show"}
      className="flex flex-col gap-6"
    >
      <motion.div variants={item}>
        <DashboardPageHeader
          title="Student dashboard"
          subtitle="Admission status and dues at a glance."
          action={
            <Link
              href={cta.href}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {cta.label}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </motion.div>

      <motion.div variants={item}>
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
            <div className="flex flex-col gap-3 text-sm">
              {mine?.studentIdCode ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Student ID</span>
                  <span className="font-bold tabular-nums">
                    {mine.studentIdCode}
                  </span>
                </div>
              ) : (
                <Badge variant="warning">Pending admission confirmation</Badge>
              )}
              {app.status === "REJECTED" ? (
                <p className="text-[13px] text-destructive">
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
      </motion.div>

      <motion.div variants={item}>
        <StatCards stats={stats} />
      </motion.div>

      <motion.div variants={item}>
        <DashboardPanel
          title="Dues summary"
          subtitle="Server totals — never computed here"
          action={
            next ? (
              <Button
                size="sm"
                disabled={pay.isPending}
                onClick={handlePayNext}
                className="rounded-lg"
              >
                {pay.isPending ? "Starting…" : "Pay next"}
              </Button>
            ) : null
          }
        >
          {next ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
              <span>
                Next:{" "}
                <strong className="tabular-nums">
                  {formatBDT(next.remaining)}
                </strong>{" "}
                by <strong>{formatDueDate(next.dueDate)}</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                {overdue.length > 0 ? `${overdue.length} overdue` : "On track"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pending installment.
            </p>
          )}
        </DashboardPanel>
      </motion.div>

      {overdue.length > 0 ? (
        <motion.div variants={item}>
          <DashboardPanel
            title="Overdue"
            subtitle="Pay these first — viewing results is blocked until clear"
          >
            <ul className="flex flex-col gap-2">
              {overdue.map((o, index) => (
                <motion.li
                  key={o.installmentId}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: reduce ? 0 : Math.min(index * 0.05, 0.3),
                    ease,
                  }}
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
                    className="rounded-lg"
                  >
                    Pay now
                  </Button>
                </motion.li>
              ))}
            </ul>
          </DashboardPanel>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
