import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Building2, Megaphone } from "lucide-react";
import { getAllDepartment } from "@/api";
import { getPublishedAnnouncements } from "@/api/announcements.api";
import type { Announcement } from "@/components/types";
import Hero from "@/components/modules/public/home/hero";

export const revalidate = 60;

type Department = { id: string; name: string; code: string };

async function getDepartments(): Promise<Department[]> {
  try {
    const res = (await getAllDepartment()) as unknown as
      | Department[]
      | { data?: Department[] };
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function getPreview(): Promise<Announcement[]> {
  try {
    const { items } = await getPublishedAnnouncements({ page: 1, limit: 3 });
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const [departments, preview] = await Promise.all([
    getDepartments(),
    getPreview(),
  ]);
  const announcements: Announcement[] = Array.isArray(preview) ? preview : [];

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Departments */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Explore departments
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find the faculty that fits your ambition.
            </p>
          </div>
        </div>
        {departments.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
            <p className="text-sm font-semibold">No departments to show yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
              The department list is currently unavailable. Please check back
              later.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <li
                key={d.id}
                className="card-hover rounded-2xl border bg-card p-5 shadow-soft"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <p className="mt-3 text-[15px] font-bold">{d.name}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {d.code}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Announcements preview */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Latest announcements
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                News and notices from the administration.
              </p>
            </div>
            <Link
              href="/announcements"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
              <p className="text-sm font-semibold">No announcements yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
                Once the administration publishes a notice, it will appear here.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-3">
              {announcements.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/announcements/${a.id}`}
                    className="card-hover flex h-full flex-col gap-2 rounded-2xl border bg-card p-5 shadow-soft"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Megaphone className="size-3.5" />
                      {formatDate(a.createdAt)}
                    </span>
                    <span className="line-clamp-2 text-[15px] font-bold leading-snug">
                      {a.title}
                    </span>
                    <span className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                      {a.body}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10">
          <h2 className="max-w-lg text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Teach with us — join as an instructor
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85">
            Submit your application with a resume, verify your email, and our
            admins will review it. Approved instructors receive login
            credentials by email.
          </p>
          <Link
            href="/instructor-apply"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-primary transition-opacity hover:opacity-90"
          >
            Apply as Instructor
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
