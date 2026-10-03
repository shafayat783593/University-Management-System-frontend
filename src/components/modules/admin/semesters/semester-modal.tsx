"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateSemester } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

interface SemesterModalProps {
  open: boolean;
  onClose: () => void;
}

// Create-only modal. Status changes live in semester-status-modal.
export default function SemesterModal({ open, onClose }: SemesterModalProps) {
  const [name, setName] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [term, setTerm] = useState("");

  const create = useCreateSemester();

  function save() {
    const yearNumber = Number(year);
    if (name.trim().length < 2 || term.trim().length < 2) {
      toast.error("Name and term need at least 2 characters.");
      return;
    }
    if (!yearNumber || yearNumber < 2000 || yearNumber > 2100) {
      toast.error("Year must be between 2000 and 2100.");
      return;
    }
    create.mutate(
      { name: name.trim(), year: yearNumber, term: term.trim() },
      {
        onSuccess: () => {
          toast.success("Semester created.");
          onClose();
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Create failed.")),
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
          <DialogTitle>New semester</DialogTitle>
          <DialogDescription>
            Year + term must be unique together.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sem-name">Name</label>
            <Input
              id="sem-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fall 2026"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sem-year">Year</label>
            <Input
              id="sem-year"
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <label htmlFor="sem-term">Term</label>
            <Input
              id="sem-term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Fall"
            />
          </div>
          <Button onClick={save} disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
