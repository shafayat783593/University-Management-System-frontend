"use client";

import { motion } from "framer-motion";
import {
  BookOpenCheck,
  CreditCard,
  IdCard,
  FileText,
  CalendarCheck2,
  MailCheck,
  Sparkles,
} from "lucide-react";
import { SectionHeading, staggerChild, staggerParent } from "./reveal";

const features = [
  { title: "Online Course Enrollment", description: "Interactive section selection with automated prerequisite enforcement and real-time seat capacity counters.", icon: BookOpenCheck, tag: "Real-time" },
  { title: "Seamless bKash Payment", description: "Direct API integration with bKash for zero-friction tuition payments, instant reconciliations, and downloadable receipts.", icon: CreditCard, tag: "Instant" },
  { title: "Official Digital ID Card", description: "Generate and download high-resolution student identity cards with verified photo, student ID, and security watermarks.", icon: IdCard, tag: "Verified" },
  { title: "Verified PDF Transcripts", description: "Instant semester GPA and cumulative CGPA calculation. Download official PDF transcripts or email them with one click.", icon: FileText, tag: "Official" },
  { title: "Attendance Tracking", description: "Session-by-session presence tracking per course section with real-time percentage indicators and threshold warnings.", icon: CalendarCheck2, tag: "Automated" },
  { title: "Instant Email Results", description: "Automated grade publication alerts delivered straight to your email with comprehensive exam mark breakdowns.", icon: MailCheck, tag: "Direct Alert" },
];

export default function FeaturesWhyUs() {
  return (
    <section className="relative overflow-hidden border-t border-border/80 bg-card py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <motion.div
          className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 24, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl"
          animate={{ x: [0, -24, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Why Choose Us"
          icon={<Sparkles className="size-3.5" />}
          title="Everything You Need for Modern Campus Life"
          description="Built from the ground up to replace outdated paperwork with an intuitive, lightning-fast digital university portal."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerChild}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-background/60 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
                <div className="relative mt-6 flex items-center gap-2 border-t border-border/40 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>Integrated Portal Feature</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
