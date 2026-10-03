"use client";

import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { Announcement } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table.pagination";
import {
  useAdminAnnouncements,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import AnnouncementModal from "./announcement-modal";

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Task 28: admin announcements CRUD (GET /announcements/admin includes drafts).
export default function AnnouncementsManager() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const list = useAdminAnnouncements(page);
  const remove = useDeleteAnnouncement();
  const toggle = useUpdateAnnouncement();

  const rows = list.data?.items ?? [];
  const meta = list.data?.meta;

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Announcement) {
    setEditing(row);
    setModalOpen(true);
  }

  function flipPublished(row: Announcement) {
    toggle.mutate(
      { id: row.id, isPublished: !row.isPublished },
      {
        onSuccess: () =>
          toast.success(row.isPublished ? "Moved to drafts." : "Published."),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Update failed.")),
      },
    );
  }

  function confirmDelete(row: Announcement) {
    const ok = window.confirm(`Delete "${row.title}"? This cannot be undone.`);
    if (!ok) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success("Announcement deleted."),
      onError: (err) => toast.error(getApiErrorMessage(err, "Delete failed.")),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Announcements"
        subtitle="Create, edit, publish or delete notices."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New announcement
          </Button>
        }
      />

      <DashboardPanel
        title="All announcements"
        subtitle={meta ? `${meta.total} total` : undefined}
      >
        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load announcements.</p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
              <Megaphone className="size-5" />
            </span>
            <p className="text-sm font-semibold">No announcements yet</p>
            <p className="text-[13px] text-muted-foreground">
              Create the first one.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className="block max-w-64 truncate text-sm font-semibold">
                        {row.title}
                      </span>
                      <span className="block max-w-64 truncate text-xs text-muted-foreground">
                        {row.body}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => flipPublished(row)}
                        title="Click to publish/unpublish"
                      >
                        <Badge
                          variant={row.isPublished ? "success" : "secondary"}
                        >
                          {row.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatDay(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(row)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-center">
              <TablePagination
                page={meta?.page ?? page}
                totalPages={meta?.totalPages ?? 1}
                handlePageChange={setPage}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      {modalOpen ? (
        <AnnouncementModal
          key={editing?.id ?? "new"}
          open={modalOpen}
          editing={editing}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
