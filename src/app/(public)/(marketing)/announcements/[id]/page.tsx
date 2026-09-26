import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays } from "lucide-react";
import {
  getAnnouncementById,
  getPublishedAnnouncements,
} from "@/api/announcements.api";

// Announcements are static content — pre-render known pages at build time.
// New announcements after the build still work via dynamicParams (rendered
// on first request), and pages revalidate in the background.
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const { items } = await getPublishedAnnouncements({ page: 1, limit: 20 });
    return items.map((a) => ({ id: a.id }));
  } catch {
    // Backend may be unreachable at build time — fall back to
    // on-demand rendering instead of failing the build.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const announcement = await getAnnouncementById(id);
    return {
      title: `${announcement.title} | UniManage`,
      description: announcement.body.slice(0, 160),
    };
  } catch {
    return { title: "Announcement | UniManage" };
  }
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let announcement;
  try {
    announcement = await getAnnouncementById(id);
  } catch {
    notFound();
  }

  let date = "";
  try {
    date = format(new Date(announcement.createdAt), "dd MMMM yyyy");
  } catch {
    date = "";
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        All announcements
      </Link>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
        {announcement.title}
      </h1>
      {date ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          Published on {date}
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        <p className="whitespace-pre-line text-[15px] leading-relaxed">
          {announcement.body}
        </p>
      </div>
    </article>
  );
}
