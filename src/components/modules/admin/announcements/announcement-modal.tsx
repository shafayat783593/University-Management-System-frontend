"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { Announcement } from "@/components/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateAnnouncement, useUpdateAnnouncement } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "w-full rounded-xl border bg-background px-3 py-2 text-sm";

// Create + edit form. Backend rules: title 3+ chars, body 10+ chars.
export default function AnnouncementModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Announcement | null;
  onClose: () => void;
}) {
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const saving = create.isPending || update.isPending;
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(editing?.category ?? "News");

  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      body: editing?.body ?? "",
      isPublished: editing?.isPublished ?? true,
    },
    onSubmit: ({ value }) => {
      if (value.title.trim().length < 3) {
        return toast.error("Title must be at least 3 characters.");
      }
      if (value.body.trim().length < 10) {
        return toast.error("Body must be at least 10 characters.");
      }
      const payload = {
        title: value.title.trim(),
        body: value.body.trim(),
        isPublished: value.isPublished,
        category,
      };
      const done = {
        onSuccess: () => {
          toast.success(editing ? "Announcement updated." : "Announcement created.");
          onClose();
        },
        onError: (err: unknown) =>
          toast.error(getApiErrorMessage(err, "Save failed.")),
      };
      if (editing) update.mutate({ id: editing.id, ...payload, image: image ?? undefined }, done);
      else create.mutate({ ...payload, image: image ?? undefined }, done);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit announcement" : "New announcement"}
          </DialogTitle>
          <DialogDescription>
            Unpublished announcements stay hidden as drafts.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.Field name="title">
            {(field) => (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Title
                <Input
                  placeholder="e.g. Eid holidays"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Category
            <select
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All News">All News</option>
              <option value="Events">Events</option>
              <option value="Academic">Academic</option>
              <option value="Campus & Community">Campus & Community</option>
              <option value="Media Corner">Media Corner</option>
              <option value="News">News</option>
            </select>
          </label>

          <form.Field name="body">
            {(field) => (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Body
                <textarea
                  rows={5}
                  placeholder="Write the full notice…"
                  className={`${inputClass} min-h-28`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className={inputClass}
            />
            {editing?.imageUrl && (
              <img
                src={editing.imageUrl}
                alt="Current"
                className="mt-2 h-24 w-full object-cover rounded-lg"
              />
            )}
          </label>

          <form.Field name="isPublished">
            {(field) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                Published
                <span className="font-normal text-muted-foreground">
                  (off = draft)
                </span>
              </label>
            )}
          </form.Field>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}