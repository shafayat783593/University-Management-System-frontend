"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Semester } from "@/components/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateSemesterStatus } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const inputClass = "h-9 w-full rounded-xl border bg-background px-3 text-sm";

interface SemesterStatusModalProps {
  open: boolean;
  semester: Semester | null;
  onClose: () => void;
}

// Status-only modal: UPCOMING → OPEN → CLOSED.
export default function SemesterStatusModal({
  open,
  semester,
  onClose,
}: SemesterStatusModalProps) {
  const [status, setStatus] = useState<string>(semester?.status ?? "OPEN");

  const changeStatus = useUpdateSemesterStatus();

  function save() {
    if (!semester) return;
    changeStatus.mutate(
      { id: semester.id, status },
      {
        onSuccess: () => {
          toast.success("Status updated.");
          onClose();
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Update failed.")),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          {semester ? (
            <DialogDescription>
              {semester.name} is currently {semester.status}.
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sem-status">Status</label>
            <select
              id="sem-status"
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <Button onClick={save} disabled={changeStatus.isPending}>
            {changeStatus.isPending ? "Saving…" : "Save status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
