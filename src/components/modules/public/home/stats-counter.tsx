"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, GraduationCap, Building2, BookOpen } from "lucide-react";
import { usePublicStats } from "@/hooks/public.hook";
import { staggerChild, staggerParent } from "./reveal";

interface StatsCounterProps {
  initialCounts?: {
    students?: number;
    instructors?: number;
    departments?: number;
    courses?: number;
  };
}

function useCountUp(endValue: number, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    let raf = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * endValue));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setCount(endValue);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [endValue, duration, trigger]);

  return count;
}

function StatCard({
  icon: Icon,
  endValue,
  label,
  description,
  accentColor,
  trigger,
}: {
  icon: React.ElementType;
  endValue: number;
  label: string;
  description: string;
  accentColor: string;
  trigger: boolean;
}) {
  const count = useCountUp(endValue, 2200, trigger);
  return (
    <motion.div
      variants={staggerChild}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentColor} opacity-70 transition-opacity group-hover:opacity-100`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-4xl">
              {count.toLocaleString()}
            </span>
            <span className="text-xl font-bold text-primary">+</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted/80 text-foreground/80 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="size-6" />
        </span>
      </div>
    </motion.div>
  );
}

// Task 6B — counts come from GET /public/stats (SSR hydrates first paint).
export default function StatsCounter({ initialCounts }: StatsCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  const { data: live } = usePublicStats(initialCounts);
  const totalStudents = live?.students ?? initialCounts?.students ?? 0;
  const totalInstructors = live?.instructors ?? initialCounts?.instructors ?? 0;
  const totalDepartments = live?.departments ?? initialCounts?.departments ?? 0;
  const totalCourses = live?.courses ?? initialCounts?.courses ?? 0;

  const stats = [
    { label: "Enrolled Students", value: totalStudents, description: "Active undergraduate & postgraduate students", icon: Users, accentColor: "from-primary to-primary/60" },
    { label: "Faculty Members", value: totalInstructors, description: "Distinguished scholars & industry experts", icon: GraduationCap, accentColor: "from-rose-500 to-orange-400" },
    { label: "Academic Departments", value: totalDepartments, description: "Accredited faculties delivering excellence", icon: Building2, accentColor: "from-violet-500 to-indigo-500" },
    { label: "Accredited Courses", value: totalCourses, description: "Industry-aligned syllabus & modern curriculum", icon: BookOpen, accentColor: "from-emerald-500 to-teal-500" },
  ];

  return (
    <section ref={containerRef} className="relative z-10 mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} endValue={stat.value} trigger={inView} />
        ))}
      </motion.div>
    </section>
  );
}
