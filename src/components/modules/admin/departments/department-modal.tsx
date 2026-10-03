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

  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const busy = create.isPending || update.isPending;

  function save() {
    if (name.trim().length < 2 || code.trim().length < 2) {
      toast.error("Name and code need at least 2 characters.");
      return;
    }
    const payload = { name: name.trim(), code: code.trim() };

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
            A short code like “CSE” works best.
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
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
