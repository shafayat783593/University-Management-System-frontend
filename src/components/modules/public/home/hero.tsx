"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  LogIn,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileText,
  Users,
  CheckCircle2,
} from "lucide-react";
import { easeOut, staggerChild, staggerParent } from "./reveal";

const portalFeatures = [
  {
    icon: FileText,
    title: "Semester Enrollment",
    subtitle: "Live seat availability",
    badge: "OPEN",
    badgeClass: "bg-primary/10 text-primary",
    iconClass: "bg-primary/10 text-primary",
  },
  {
    icon: CreditCard,
    title: "Tuition Payment",
    subtitle: "Seamless bKash integration",
    badge: "INSTANT",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Users,
    title: "Faculty & Routine",
    subtitle: "Verified academic mentors",
    badge: "LIVE",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.06] via-background to-background py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start gap-6 lg:col-span-7"
          >
          

            <motion.h1
              variants={staggerChild}
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.08]"
            >
              Empowering Futures with{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                World-Class Education
              </span>{" "}
              & Innovation
            </motion.h1>

            <motion.p
              variants={staggerChild}
              className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Northfield University&apos;s unified portal simplifies your entire academic
              journey. Apply for admission, enroll in courses, download official
              transcripts, track attendance, and pay fees via bKash — all in one modern
              platform.
            </motion.p>

            <motion.div variants={staggerChild} className="flex w-full flex-wrap items-center gap-3 pt-2 sm:w-auto">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95"
                >
                  <GraduationCap className="size-4.5" />
                  Apply as Student
                  <ArrowRight className="size-4" />
                </Link>
              </motion.span>
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/80"
                >
                  <LogIn className="size-4 text-muted-foreground" />
                  Login
                </Link>
              </motion.span>
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/instructors/apply"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                >
                  <Sparkles className="size-4" />
                  Join as Instructor
                </Link>
              </motion.span>
            </motion.div>

            <motion.div
              variants={staggerChild}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-medium text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                UGC & Govt. Recognized
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Instant ID Verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="size-4 text-rose-500" />
                Instant bKash Gateway
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [...easeOut], delay: 0.2 }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-primary/30 to-violet-500/30 opacity-70 blur-xl" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <GraduationCap className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Student Portal</p>
                      <p className="text-xs text-muted-foreground">Northfield University</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Active Session
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {portalFeatures.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: [...easeOut] }}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 p-3.5 transition-colors hover:bg-muted/70"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`grid size-9 place-items-center rounded-lg ${f.iconClass}`}>
                          <f.icon className="size-4.5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{f.title}</p>
                          <p className="text-[11px] text-muted-foreground">{f.subtitle}</p>
                        </div>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${f.badgeClass}`}>
                        {f.badge}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Action
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        Ready to join our community?
                      </p>
                    </div>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                    >
                      Start
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
