"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarX2,
} from "lucide-react";
import type { SemesterCalendar } from "@/components/types";
import { SectionHeading, staggerChild, staggerParent } from "./reveal";

interface AcademicCalendarProps {
  calendar?: SemesterCalendar | null;
}

function formatDay(dateStr?: string | null) {
  if (!dateStr) return "TBD";
  try {
    return format(new Date(dateStr), "dd MMMM yyyy");
  } catch {
    return dateStr;
  }
}

function getEventBadge(type: string) {
  switch (type.toUpperCase()) {
    case "ENROLLMENT":
      return { label: "Registration Window", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 };
    case "EXAM":
      return { label: "Examination Week", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: AlertCircle };
    case "RESULT":
      return { label: "Result Publication", color: "bg-primary/10 text-primary border-primary/20", icon: FileText };
    default:
      return { label: "Academic Event", color: "bg-muted text-muted-foreground border-border", icon: Clock };
  }
}

export default function AcademicCalendarSection({ calendar }: AcademicCalendarProps) {
  // Real API: GET /semesters/:id/calendar (resolved server-side for the OPEN semester).
  const events = calendar?.events ?? [];
  const semesterName = calendar?.semesterName ?? null;

  return (
    <section className="border-t border-border/80 bg-gradient-to-b from-muted/40 to-background py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Academic Schedule"
          icon={<CalendarDays className="size-3.5" />}
          title={semesterName ? `Academic Calendar — ${semesterName}` : "Academic Calendar"}
          description="Critical academic deadlines: course registration, mid/final exams, and official grade publication dates."
          action={
            calendar?.semesterId ? (
              <Link
                href={`/semesters/${calendar.semesterId}/calendar`}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                View detailed calendar
                <ArrowRight className="size-4" />
              </Link>
            ) : undefined
          }
        />

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <CalendarX2 className="size-6" />
            </span>
            <p className="mt-4 text-base font-bold">Calendar not published yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              The academic calendar for the current semester hasn&apos;t been published. Once the
              registrar opens a semester, key dates will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {events.map((event, idx) => {
              const badge = getEventBadge(event.type);
              const Icon = badge.icon;
              const startFormatted = formatDay(event.start);
              const endFormatted = formatDay(event.end);
              const isRange = event.start && event.end && event.start !== event.end;
              return (
                <motion.div
                  key={`${event.type}-${idx}`}
                  variants={staggerChild}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge.color}`}>
                        <Icon className="size-3.5" />
                        {badge.label}
                      </span>
                      <span className="text-xs font-extrabold text-muted-foreground">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {event.label}
                    </h3>
                    <div className="mt-4 rounded-xl border border-border/50 bg-muted/50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Clock className="size-3.5 text-primary" />
                        <span>{isRange ? "Scheduled Duration" : "Target Date"}</span>
                      </div>
                      <div className="mt-2">
                        {isRange ? (
                          <div className="flex flex-col gap-1 text-sm font-semibold text-foreground">
                            <span className="flex items-center gap-2">
                              <span className="text-xs font-normal text-muted-foreground">Start:</span>
                              {startFormatted}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs font-normal text-muted-foreground">End:</span>
                              {endFormatted}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-foreground">{startFormatted}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    <span>Semester milestone</span>
                    <span className="font-semibold text-primary">Official Schedule</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
