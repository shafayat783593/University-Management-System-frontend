// src/components/legal/legal-layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

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
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to home
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
      <p className="mt-6 leading-7">{intro}</p>

      <nav aria-label="Contents" className="mt-8 rounded-xl border p-4 text-sm">
        <p className="mb-2 font-medium">Contents</p>
        <ol className="list-decimal space-y-1 pl-5">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a href={`#s${i + 1}`} className="hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <section key={s.title} id={`s${i + 1}`} className="scroll-mt-20">
            <h2 className="text-xl font-semibold">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 leading-7 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        See also:{" "}
        <Link href={other.href} className="underline">
          {other.label}
        </Link>
      </p>
    </main>
  );
}