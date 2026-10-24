"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  BookOpen,
  Users,
  ArrowRight,
  GraduationCap,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import type { FeeScheduleLine } from "@/api/public.api";
import { usePublicDepartmentCards } from "@/hooks/public.hook";
import { formatBDT } from "@/lib/format";
import { CardSkeleton, EmptyState, SectionHeading, staggerChild, staggerParent } from "./reveal";

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: {
    courses?: number;
    instructors?: number;
    students?: number;
  };
  feeSchedule?: FeeScheduleLine[];
}

interface ProgramsDepartmentsProps {
  departments?: DepartmentItem[];
  semesterName?: string | null;
}

// Easy rate card: per-credit tuition on one line, fixed fees below it.
function RateCard({ fees }: { fees: FeeScheduleLine[] }) {
  if (fees.length === 0) return null;
  const tuition = fees.find((f) => f.calcMethod === "PER_CREDIT");
  const fixed = fees.filter((f) => f.calcMethod !== "PER_CREDIT");
  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
      {tuition && (
        <p className="font-bold text-foreground">
          {formatBDT(tuition.amount)} <span className="font-medium text-muted-foreground">/ credit</span>
        </p>
      )}
      {fixed.length > 0 && (
        <ul className="mt-1.5 space-y-1 text-muted-foreground">
          {fixed.slice(0, 3).map((f) => (
            <li key={f.itemType} className="flex items-center justify-between gap-2">
              <span className="capitalize">{f.label}</span>
              <span className="font-semibold text-foreground tabular-nums">{formatBDT(f.amount)}</span>
            </li>
          ))}
          {fixed.length > 3 && <li>+{fixed.length - 3} more fees</li>}
        </ul>
      )}
    </div>
  );
}

export default function ProgramsDepartments({ departments: initialDepartments, semesterName }: ProgramsDepartmentsProps) {
  // Task 6B — GET /public/departments gives departments + feeSchedule + semester.
  const { data: live, isLoading, isError, refetch } = usePublicDepartmentCards();

  const list: DepartmentItem[] =
    (live?.departments?.length ?? 0) > 0
      ? (live?.departments as DepartmentItem[])
      : (initialDepartments ?? []);

  return (
    <section id="programs" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Academic Programs"
        icon={<GraduationCap className="size-3.5" />}
        title="Explore Faculties & Departments"
        description={
          semesterName
            ? `Live catalogue for ${semesterName} — per-credit tuition with fixed fees shown separately.`
            : "Live department catalogue from the registrar — per-credit tuition with fixed fees shown separately."
        }
        action={
          <Link
            href="/student/programs"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            View all programs
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {isLoading && list.length === 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError && list.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="text-base font-bold">Couldn&apos;t load departments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The academic catalogue is temporarily unavailable. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState
            title="No departments published yet"
            description="The registrar hasn't published any academic departments. Check back soon or contact admissions."
          />
        </motion.div>
      ) : (
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {list.map((dept) => {
            const courseCount = dept._count?.courses ?? 0;
            const instructorCount = dept._count?.instructors ?? 0;
            const studentCount = dept._count?.students ?? 0;
            return (
              <motion.div key={dept.id} variants={staggerChild} whileHover={{ y: -6 }}>
                <Link
                  href={`/departments/${dept.id}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 size-36 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Building2 className="size-6" />
                      </span>
                      <span className="rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-foreground">
                        {dept.code}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {dept.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {dept.description || "Accredited undergraduate curriculum with research and internship opportunities."}
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border/60 py-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="size-3.5 shrink-0 text-primary" />
                        <span><strong className="text-foreground tabular-nums">{courseCount}</strong> Courses</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5 shrink-0 text-rose-500" />
                        <span><strong className="text-foreground tabular-nums">{instructorCount}</strong> Faculty</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FolderOpen className="size-3.5 shrink-0 text-emerald-500" />
                        <span><strong className="text-foreground tabular-nums">{studentCount}</strong> Students</span>
                      </div>
                    </div>
                    <RateCard fees={dept.feeSchedule ?? []} />
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-bold text-primary">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      View Program Curriculum
                    </span>
                    <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
