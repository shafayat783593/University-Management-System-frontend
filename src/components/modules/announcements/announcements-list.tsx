"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { usePublishedAnnouncements } from "@/hooks";
import TablePagination from "@/components/ui/table.pagination";
import { Skeleton } from "@/components/ui/skeleton";
import AnnouncementCard from "@/components/modules/announcements/announcement-card";

const PAGE_SIZE = 9;

export default function AnnouncementsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePublishedAnnouncements(
    page,
    PAGE_SIZE,
  );

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
        Announcements
      </h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Official notices and news from the university administration.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 rounded-2xl border bg-card p-5"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-16 w-full" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
            <p className="text-sm font-semibold">Could not load announcements</p>
            <p className="text-[13px] text-muted-foreground">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
              <Megaphone className="size-5" />
            </span>
            <p className="text-sm font-semibold">No announcements yet</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Once the administration publishes a notice, it will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <li key={a.id}>
                  <AnnouncementCard announcement={a} />
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <TablePagination
                page={meta?.page ?? page}
                totalPages={meta?.totalPages ?? 1}
                handlePageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
