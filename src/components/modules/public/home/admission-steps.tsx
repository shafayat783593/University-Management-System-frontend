"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  MailCheck,
  Compass,
  FileCheck2,
  CreditCard,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SectionHeading, staggerChild, staggerParent } from "./reveal";

const steps = [
  { step: "01", title: "Register Account", subtitle: "Create applicant profile", description: "Sign up in seconds using your name and active email to create your applicant portal.", icon: UserPlus },
  { step: "02", title: "Verify Email", subtitle: "Quick OTP confirmation", description: "Enter the 6-digit one-time verification password sent to your inbox to activate your account.", icon: MailCheck },
  { step: "03", title: "Browse Program", subtitle: "Choose your department", description: "Explore diverse faculties, curriculum structures, faculty profiles, and semester outlines.", icon: Compass },
  { step: "04", title: "Submit Application", subtitle: "SSC & HSC academic data", description: "Enter your educational background including SSC/HSC boards, passing years, GPA, and guardian info.", icon: FileCheck2 },
  { step: "05", title: "Enroll & Pay", subtitle: "Secure bKash checkout", description: "Select your class section, confirm your seat, and pay tuition fees securely via bKash gateway.", icon: CreditCard },
];

export default function AdmissionSteps() {
  return (
    <section className="relative overflow-hidden border-y border-border/80 bg-muted/30 py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Admission Workflow"
          icon={<Sparkles className="size-3.5" />}
          title="How Admission Works in 5 Simple Steps"
          description="No long campus queues or manual paperwork. Everything from account setup to bKash tuition confirmation happens online smoothly."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-16"
        >
          <div className="absolute left-8 right-8 top-1/2 hidden h-0.5 -translate-y-8 bg-gradient-to-r from-primary/20 via-violet-500/30 to-emerald-500/30 lg:block" aria-hidden />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  variants={staggerChild}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-2xl font-black tracking-tight text-muted-foreground/40 transition-colors group-hover:text-primary/70">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-primary">{item.subtitle}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3 text-[11px] font-bold text-muted-foreground">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.span
                        className="block h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${((index + 1) / 5) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </span>
                    <span>Step {index + 1}/5</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
            >
              Start Your Admission Application
              <ArrowRight className="size-4" />
            </Link>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
