import Image from "next/image";
import Link from "next/link";
import { Newsreader } from "next/font/google";

import InstructorApplyForm from "@/components/from/Instructor-from";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
});

const stats = [
  { value: "1892", label: "Founded" },
  { value: "12.4k", label: "Students" },
  { value: "86", label: "Programs" },
];

export default function InstructorApply() {
  return (
    <div className={`${newsreader.variable} grid min-h-svh lg:grid-cols-[minmax(0,480px)_1fr] xl:grid-cols-[minmax(0,520px)_1fr]`}>
      {/* Form side */}
      <div className="flex flex-col gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-[family-name:var(--font-newsreader)] text-base font-semibold">
              NU
            </span>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-foreground">
              Northfield University
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Management portal
            </span>
          </span>
        </Link>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm">
            <InstructorApplyForm />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} Northfield University. All rights reserved.
        </p>
      </div>

      {/* Image side */}
      <div className="relative hidden lg:block">
        <Image
          src="/doctorLogin.webp"
          alt="Students walking across the Northfield University campus"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover dark:brightness-[0.55] dark:saturate-[0.85]"
        />

        {/* Readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

        {/* Overlaid brand content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 p-12 xl:p-16">
          <p className="font-[family-name:var(--font-newsreader)] max-w-md text-[26px] italic leading-snug text-white xl:text-[30px]">
            &ldquo;Everything from admissions to grading, in one place built for how a
            university actually runs.&rdquo;
          </p>

          <div className="flex items-center gap-8 border-t border-white/20 pt-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div>
                  <p className="font-[family-name:var(--font-newsreader)] text-2xl font-medium text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/70">{stat.label}</p>
                </div>
                {index < stats.length - 1 && (
                  <span className="h-8 w-px bg-white/20" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
