"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Megaphone, CalendarDays, ArrowRight, Bell, Inbox } from "lucide-react";
import { usePublishedAnnouncements } from "@/hooks/announcements.hook";
import type { Announcement } from "@/components/types";
import { CardSkeleton, EmptyState, SectionHeading, staggerChild, staggerParent } from "./reveal";

interface LatestAnnouncementsProps {
  announcements?: Announcement[];
}

function formatDate(value?: string) {
  if (!value) return "Notice";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return "Recent";
  }
}

export default function LatestAnnouncements({ announcements: initialAnnouncements }: LatestAnnouncementsProps) {
  // Real API: GET /announcements?page=1&limit=3
  const { data, isLoading, isError, refetch } = usePublishedAnnouncements(
    1,
    3,
    undefined,
    initialAnnouncements,
  );

  const activeList = (data?.items ?? []).slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Campus Circulars"
        icon={<Bell className="size-3.5" />}
        title="Latest Announcements & Notices"
        description="Official academic communications, examination notices, and administrative updates from the Registrar's Office."
        action={
          <Link
            href="/announcements"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            View all notices
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {isLoading && activeList.length === 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      ) : isError && activeList.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="text-base font-bold">Couldn&apos;t load announcements</p>
          <p className="mt-1 text-sm text-muted-foreground">Please check your connection and retry.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : activeList.length === 0 ? (
        <motion.div variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12 grid gap-6 md:grid-cols-3">
          <EmptyState
            title="No announcements yet"
            description="There are no published circulars right now. New notices from the Registrar will appear here."
          />
        </motion.div>
      ) : (
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {activeList.map((notice) => (
            <motion.div key={notice.id} variants={staggerChild} whileHover={{ y: -6 }}>
              <Link
                href={`/announcements/${notice.id}`}
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <CalendarDays className="size-3.5" />
                      {formatDate(notice.createdAt)}
                    </span>
                    <span className="grid size-8 place-items-center rounded-lg bg-muted/80 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Megaphone className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {notice.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {notice.body}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-bold text-primary">
                  <span>Read notice details</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeList.length === 0 && !isLoading ? (
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Inbox className="size-4" /> Live feed: GET /announcements?limit=3
        </p>
      ) : null}
    </section>
  );
}
