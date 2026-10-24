"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdmissionStepState = "done" | "current" | "todo";

export interface AdmissionStep {
  n: number;
  title: string;
  desc: string;
  href: string;
  state: AdmissionStepState;
  pill?: string;
}

/**
 * Derive the 7-step student pipeline from backend state.
 * - application: null = never applied
 * - status: PENDING / APPROVED / REJECTED
 * - confirmed: admission confirmed (fee paid)
 * - hasTuitionFee / hasPaidInstallment: semester billing state
 */
export function buildAdmissionSteps(opts: {
  hasApplication: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED" | null;
  confirmed?: boolean;
  hasAdmissionFee?: boolean;
  admissionPaid?: boolean;
  hasTuitionFee?: boolean;
  hasPaidInstallment?: boolean;
}): AdmissionStep[] {
  const {
    hasApplication,
    status,
    confirmed,
    hasAdmissionFee,
    admissionPaid,
    hasTuitionFee,
    hasPaidInstallment,
  } = opts;

  const applied = hasApplication;
  const submitted = applied; // application fee TrxID goes with the form itself
  const reviewed = status === "APPROVED" || status === "REJECTED";
  const offered = status === "APPROVED";
  const admissionDone = Boolean(confirmed || admissionPaid);
  const registered = Boolean(hasTuitionFee);
  const paying = Boolean(hasPaidInstallment);

  const done = (c: boolean): AdmissionStepState => (c ? "done" : "todo");

  // current = first incomplete step in order
  const order = [
    applied,
    submitted,
    reviewed,
    offered,
    admissionDone,
    registered,
    paying,
  ];
  const currentIdx = order.findIndex((v) => !v);

  const stateAt = (i: number, completed: boolean): AdmissionStepState => {
    if (completed) return "done";
    if (i === currentIdx) return "current";
    return "todo";
  };

  return [
    {
      n: 1,
      title: "Apply for Admission",
      desc: "Personal → Academic → Program → Documents",
      href: "/student/admission-application",
      state: stateAt(0, applied),
      pill: applied ? undefined : "Start",
    },
    {
      n: 2,
      title: "Pay Application Fee",
      desc: "bKash TrxID → verify → submit",
      href: "/student/admission-application",
      state: stateAt(1, submitted),
      pill: submitted ? "Submitted" : undefined,
    },
    {
      n: 3,
      title: "Application Review",
      desc: "Documents, eligibility, admission test",
      href: "/student/admission-application",
      state: stateAt(2, reviewed),
      pill:
        status && status !== "PENDING"
          ? status
          : reviewed
            ? undefined
            : "Under Review",
    },
    {
      n: 4,
      title: "Admission Offer",
      desc: "Approved → invoice + payment deadline",
      href: "/student/payments/my-fees",
      state: stateAt(3, offered),
      pill: offered ? "Offered" : undefined,
    },
    {
      n: 5,
      title: "Confirm Admission",
      desc: "Pay admission amount → student record",
      href: "/student/payments/my-fees",
      state: stateAt(4, admissionDone),
      pill: admissionDone
        ? "Confirmed"
        : hasAdmissionFee
          ? "Fee Due"
          : undefined,
    },
    {
      n: 6,
      title: "Semester Registration",
      desc: "Select semester + courses → invoice → 1st installment",
      href: "/student/enrollments",
      state: stateAt(5, registered),
      pill: registered ? undefined : "Next",
    },
    {
      n: 7,
      title: "Pay Installments",
      desc: "Schedule → pay due → receipt",
      href: "/student/payments/my-fees",
      state: stateAt(6, paying && registered) || done(paying),
      pill: paying ? "Paying" : undefined,
    },
  ];
}

export default function AdmissionTracker({
  steps,
}: {
  steps: AdmissionStep[];
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
      {steps.map((s) => (
        <li key={s.n}>
          <Link
            href={s.href}
            className={cn(
              "flex h-full flex-col gap-1.5 rounded-2xl border p-3.5 transition-colors hover:border-primary/40",
              s.state === "done" && "border-success/30 bg-success/[0.06]",
              s.state === "current" && "border-primary/40 bg-primary/[0.06]",
              s.state === "todo" && "bg-card",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-[13px] font-bold",
                  s.state === "done" && "bg-success text-white",
                  s.state === "current" && "bg-primary text-white",
                  s.state === "todo" && "bg-muted text-muted-foreground",
                )}
              >
                {s.state === "done" ? <Check className="size-4" /> : s.n}
              </span>
              {s.pill ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                    s.state === "done"
                      ? "bg-success/15 text-success"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {s.pill}
                </span>
              ) : null}
            </span>
            <span className="text-[13px] font-bold leading-tight">
              {s.title}
            </span>
            <span className="text-[11px] leading-snug text-muted-foreground">
              {s.desc}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
