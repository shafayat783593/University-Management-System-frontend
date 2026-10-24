"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle2,
  Users,
} from "lucide-react";
import { usePublicFacultyList } from "@/hooks/public.hook";
import type { InstructorApplication } from "@/components/types";
import { CardSkeleton, EmptyState, SectionHeading, staggerChild, staggerParent } from "./reveal";

export interface InstructorItem {
  id: string;
  name: string;
  department: string;
  qualification: string;
  photoUrl?: string | null;
}

interface FacultyHighlightProps {
  instructors?: InstructorItem[];
  initialApplications?: InstructorApplication[];
}

function toItem(inst: InstructorApplication): InstructorItem {
  return {
    id: inst.id,
    name: inst.user?.name ?? "Faculty Member",
    department: inst.department?.name ?? "Academic Faculty",
    qualification: inst.qualification ?? "Distinguished Professor",
    photoUrl: inst.user?.imageUrl ?? null,
  };
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "F";
}

export default function FacultyHighlight({ instructors: initialInstructors, initialApplications }: FacultyHighlightProps) {
  // Task 6B — GET /public/faculty (no auth). Falls back to SSR items.
  const { data: publicRows, isLoading, isError, refetch } = usePublicFacultyList(4);

  const liveItems: InstructorItem[] = (publicRows ?? []).map((f) => ({
    id: f.id,
    name: f.user?.name ?? "Faculty Member",
    department: f.department?.name ?? "Academic Faculty",
    qualification: f.qualification ?? "Distinguished Professor",
    photoUrl: f.user?.imageUrl ?? null,
  }));
  const ssrItems = initialInstructors ?? (initialApplications ?? []).map(toItem);
  const list = (liveItems.length > 0 ? liveItems : ssrItems).slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Academic Leadership"
        icon={<Award className="size-3.5" />}
        title="Distinguished Faculty & Mentors"
        description="Verified educators approved by the faculty council — learn directly from researchers and industry practitioners."
        action={
          <Link
            href="/instructors/apply"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            Join our faculty board
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {isLoading && list.length === 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      ) : isError && list.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="text-base font-bold">Couldn&apos;t load faculty</p>
          <p className="mt-1 text-sm text-muted-foreground">Please retry in a moment.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <EmptyState
            title="Faculty list coming soon"
            description="Approved instructor profiles will appear here once the faculty council completes verifications."
            action={
              <Link
                href="/instructors/apply"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                <Users className="size-4" /> Apply as Instructor
              </Link>
            }
          />
        </motion.div>
      ) : (
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {list.map((instructor) => (
            <motion.div
              key={instructor.id}
              variants={staggerChild}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
            >
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15">
                  {instructor.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.photoUrl}
                      alt={instructor.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary">
                      <GraduationCap className="size-14" />
                      <span className="text-2xl font-extrabold">{initials(instructor.name)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-bold text-primary shadow-xs backdrop-blur-md">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span>Verified</span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                  {instructor.name}
                </h3>
                <p className="mt-1 text-xs font-semibold text-primary">{instructor.department}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {instructor.qualification}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                <span>Full-time Faculty</span>
                <span className="font-semibold text-foreground">Active Term</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-violet-600 p-8 text-white shadow-xl sm:p-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-black/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Academic Careers
            </span>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-balance">
              Teach with us — join as an instructor
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
              Submit your curriculum vitae and academic credentials. Upon verification by our
              faculty council, you&apos;ll receive credentials to manage courses, publish class
              routines, and submit examination marks online.
            </p>
          </div>
          <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="shrink-0">
            <Link
              href="/instructors/apply"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-primary shadow-lg"
            >
              Apply as Instructor
              <ArrowRight className="size-4" />
            </Link>
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
