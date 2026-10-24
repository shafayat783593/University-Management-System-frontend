"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileCheck2,
  KeyRound,
  LogOut,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

// Shared pretty shell for full-screen account gates.
// A gate BLOCKS the dashboard until the user finishes a required step.
function GateShell({
  icon: Icon,
  eyebrow,
  title,
  description,
  points,
  actionHref,
  actionLabel,
  tone,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  actionHref: string;
  actionLabel: string;
  tone: "amber" | "primary" | "violet";
}) {
  const tones = {
    amber: "from-amber-500 to-orange-500",
    primary: "from-primary to-indigo-500",
    violet: "from-violet-500 to-purple-500",
  } as const;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-b from-muted/60 via-background to-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-72 w-[560px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 text-center shadow-xl"
      >
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className={`mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}
        >
          <Icon className="size-8" />
        </motion.span>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-balance">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
        <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left">
          {points.map((point, i) => (
            <motion.li
              key={point}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-[13px] font-medium"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              {point}
            </motion.li>
          ))}
        </ul>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
          >
            {actionLabel}
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
        <Link
          href="/logout"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          Use a different account
        </Link>
      </motion.div>
    </div>
  );
}

// 1. First-login password must be changed before anything else.
export function PasswordGate() {
  return (
    <GateShell
      icon={KeyRound}
      tone="amber"
      eyebrow="Security required"
      title="Change your temporary password"
      description="Your account is locked until you replace the temporary password with one only you know."
      points={[
        "Go to your profile page",
        "Open “Change password” and set a new one",
        "Your dashboard unlocks automatically",
      ]}
      actionHref="/profile"
      actionLabel="Go to change password"
    />
  );
}

// 2. STUDENT with no studentProfile → one-time /complete-profile (dept + phone).
export function ProfileGate() {
  return (
    <GateShell
      icon={UserRoundCheck}
      tone="violet"
      eyebrow="One step left"
      title="Complete your student profile"
      description="Your account exists but has no student profile yet. Finish this once to unlock everything."
      points={[
        "Pick your department",
        "Add your phone number (optional)",
        "Then submit the admission application",
      ]}
      actionHref="/complete-profile"
      actionLabel="Complete my profile"
    />
  );
}

// 3. Admission application unlocks enrollment and the dashboard.
export function AdmissionGate() {
  return (
    <GateShell
      icon={FileCheck2}
      tone="primary"
      eyebrow="Admission required"
      title="Submit your admission application"
      description="The dashboard stays locked until your admission application is on file. It takes about two minutes."
      points={[
        "Enter your previous institution",
        "Add SSC / HSC board, year and GPA",
        "Submit — enrollment unlocks instantly",
      ]}
      actionHref="/student/admission-application"
      actionLabel="Start admission application"
    />
  );
}
