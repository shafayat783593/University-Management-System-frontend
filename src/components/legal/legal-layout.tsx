"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/layout/public/Footer";
import Header from "@/components/layout/public/Header";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

const ease = [0.21, 1.02, 0.73, 1] as const;

export function LegalLayout({
  title,
  updated,
  intro,
  sections,
  other,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  other: { href: string; label: string };
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const els = sections
      .map((_, i) => document.getElementById(`s${i + 1}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.id.slice(1)) - 1;
            if (!Number.isNaN(index)) setActive(index);
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );

    els.forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [reduce, sections]);

  const heroVariants: Variants | undefined = reduce
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
      };
  const heroItem: Variants | undefined = reduce
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
      };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-border/60 bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <motion.div
              variants={heroVariants}
              initial={reduce ? false : "hidden"}
              animate={reduce ? undefined : "show"}
            >
              <motion.h1
                variants={heroItem}
                className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                {title}
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-2 text-sm text-muted-foreground"
              >
                Last updated: {updated}
              </motion.p>

              <motion.p
                variants={heroItem}
                className="mt-6 max-w-3xl text-pretty leading-7 text-foreground/90"
              >
                {intro}
              </motion.p>

              <motion.div
                variants={heroItem}
                className="mt-6 flex flex-wrap items-center gap-3 text-sm"
              >
                <Link
                  href={other.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Read the {other.label}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Back to home
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
            {/* TOC */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="Contents"
                className="rounded-2xl border border-border/60 bg-card p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  On this page
                </p>
                <ol className="mt-3 space-y-1.5">
                  {sections.map((s, i) => (
                    <li key={s.title}>
                      <a
                        href={`#s${i + 1}`}
                        className={`block rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                          active === i
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* Article */}
            <article className="min-w-0">
              {sections.map((s, i) => (
                <motion.section
                  key={s.title}
                  id={`s${i + 1}`}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease, delay: i === 0 ? 0 : 0 }}
                  className="scroll-mt-24 border-t border-border/60 py-8 first:border-t-0 first:pt-0"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h2>
                  <div className="mt-4 space-y-4 leading-7 text-foreground/90 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_ul]:space-y-2">
                    {s.body}
                  </div>
                </motion.section>
              ))}
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
