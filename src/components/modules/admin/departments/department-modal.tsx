"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Department } from "@/components/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

interface DepartmentModalProps {
  open: boolean;
  editing: Department | null;
  onClose: () => void;
}

// Create + edit modal. editing === null means "create new".
export default function DepartmentModal({
  open,
  editing,
  onClose,
}: DepartmentModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [code, setCode] = useState(editing?.code ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [fee, setFee] = useState(
    editing?.tuitionFeePerSemester != null ? String(editing.tuitionFeePerSemester) : "",
  );

  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const busy = create.isPending || update.isPending;

  function save() {
    if (name.trim().length < 2 || code.trim().length < 2) {
      toast.error("Name and code need at least 2 characters.");
      return;
    }
    const trimmedFee = fee.trim();
    const parsedFee = trimmedFee === "" ? undefined : Number(trimmedFee);
    if (parsedFee !== undefined && (!Number.isFinite(parsedFee) || parsedFee < 0)) {
      toast.error("Tuition fee must be a positive number (or left empty).");
      return;
    }
    const payload = {
      name: name.trim(),
      code: code.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(parsedFee !== undefined ? { tuitionFeePerSemester: parsedFee } : {}),
    };

    if (editing) {
      update.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Department updated.");
            onClose();
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Update failed.")),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Department created.");
          onClose();
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Create failed.")),
      });
    }
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
          <DialogTitle>
            {editing ? "Edit department" : "New department"}
          </DialogTitle>
          <DialogDescription>
            A short code like “CSE” works best. Description and tuition fee appear
            on the public program page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="dept-name">Name</label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Computer Science"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="dept-code">Code</label>
            <Input
              id="dept-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CSE"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="dept-description">Description (optional)</label>
            <textarea
              id="dept-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this program covers, careers, highlights…"
              rows={3}
              className="rounded-xl border border-input bg-card px-3 py-2 text-sm font-normal outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="dept-fee">Tuition fee per semester (optional, ৳)</label>
            <Input
              id="dept-fee"
              type="number"
              min={0}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="55000"
            />
          </div>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
