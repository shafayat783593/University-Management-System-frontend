import Link from "next/link";
import { ArrowRight, GraduationCap, LogIn, Megaphone } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
          <GraduationCap className="size-3.5 text-primary" />
          Admissions open for the upcoming semester
        </span>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl">
          Your entire university journey, in one place
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Apply for admission, enroll in courses, track attendance, view results
          and transcripts, and pay fees online — whether you are a student or
          joining us as an instructor.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-pop transition-opacity hover:opacity-90"
          >
            Apply as Student
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <LogIn className="size-4" />
            Login
          </Link>
        </div>
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <Megaphone className="size-4" />
          See the latest announcements
        </Link>
      </div>
    </section>
  );
}
