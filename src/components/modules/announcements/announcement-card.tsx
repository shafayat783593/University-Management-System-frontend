import Link from "next/link";
import { format } from "date-fns";
import { Megaphone } from "lucide-react";
import type { Announcement } from "@/components/types";

export function formatAnnouncementDate(value: string) {
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return "";
  }
}

export default function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  return (
    <Link
      href={`/announcements/${announcement.id}`}
      className="card-hover flex h-full flex-col gap-2 rounded-2xl border bg-card p-5 shadow-soft"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Megaphone className="size-3.5" />
        {formatAnnouncementDate(announcement.createdAt)}
      </span>
      <span className="line-clamp-2 text-[15px] font-bold leading-snug">
        {announcement.title}
      </span>
      <span className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
        {announcement.body}
      </span>
      <span className="mt-auto pt-1 text-[13px] font-semibold text-primary">
        Read more →
      </span>
    </Link>
  );
}
