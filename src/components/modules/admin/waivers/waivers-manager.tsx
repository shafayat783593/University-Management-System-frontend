"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  useCreateWaiver,
  useSemesters,
  useUpdateWaiver,
  useWaivers,
  type CreateWaiverPayload,
} from "@/hooks";
import type { Waiver } from "@/api";

// One applied waiver + revoke button (revoking never moves applied money).
function WaiverCard({ waiver }: { waiver: Waiver }) {
  const update = useUpdateWaiver();

  function handleRevoke() {
    if (!window.confirm(`Revoke "${waiver.name}"? Applied discounts stay as they are.`)) return;
    update.mutate(
      { id: waiver.id, payload: { isActive: false } },
      {
        onSuccess: () => toast.success("Waiver revoked."),
        onError: (err) => toast.error(getApiErrorMessage(err, "Could not revoke.")),
      },
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">
            {waiver.name}{" "}
            <span className="font-normal text-muted-foreground">
              · {waiver.student?.user.name ?? waiver.studentId}
            </span>
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {waiver.percent != null ? `${waiver.percent}%` : formatBDT(waiver.fixedAmount ?? 0)}
            {" → "}cut {formatBDT(waiver.amountApplied)}
            {waiver.invoiceNumber ? ` on ${waiver.invoiceNumber}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{waiver.type}</Badge>
          <Badge variant={waiver.isActive ? "success" : "destructive"}>
            {waiver.isActive ? "Active" : "Revoked"}
          </Badge>
          {waiver.isActive ? (
            <Button size="sm" variant="outline" disabled={update.isPending} onClick={handleRevoke}>
              Revoke
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

interface WaiverForm {
  studentId: string;
  semesterId: string;
  type: string;
  name: string;
  percent: string;
  fixedAmount: string;
  reason: string;
}

const EMPTY_FORM: WaiverForm = {
  studentId: "",
  semesterId: "",
  type: "WAIVER",
  name: "",
  percent: "",
  fixedAmount: "",
  reason: "",
};

// Create form. studentId is the student's UUID (see Dues & Reports for
// names + IDs) — the discount lands on their unpaid invoice right away.
function WaiverCreateForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const create = useCreateWaiver();
  const semestersQuery = useSemesters();
  const semesters = semestersQuery.data?.items ?? [];

  function set<K extends keyof WaiverForm>(key: K, value: WaiverForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.studentId.trim()) return toast.error("Student ID is required.");
    if (form.name.trim().length < 2) return toast.error("Give the waiver a name.");
    const percent = form.percent.trim() === "" ? undefined : Number(form.percent);
    const fixedAmount = form.fixedAmount.trim() === "" ? undefined : Number(form.fixedAmount);
    if (percent === undefined && fixedAmount === undefined) {
      return toast.error("Provide a percent and/or a fixed amount.");
    }
    if (percent !== undefined && (!Number.isFinite(percent) || percent <= 0 || percent > 100)) {
      return toast.error("Percent must be between 0 and 100.");
    }
    if (fixedAmount !== undefined && (!Number.isFinite(fixedAmount) || fixedAmount <= 0)) {
      return toast.error("Fixed amount must be positive.");
    }
    const payload: CreateWaiverPayload = {
      studentId: form.studentId.trim(),
      semesterId: form.semesterId || undefined,
      type: form.type as CreateWaiverPayload["type"],
      name: form.name.trim(),
      percent,
      fixedAmount,
      reason: form.reason.trim() || undefined,
    };
    create.mutate(payload, {
      onSuccess: (w) => {
        toast.success(`Applied — cut ${formatBDT(w.amountApplied)}.`);
        setForm({ ...EMPTY_FORM });
        onDone();
      },
      onError: (err) => toast.error(getApiErrorMessage(err, "Could not apply waiver.")),
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-[13px] font-semibold">
          Student ID (UUID)
          <Input value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="e.g. 3fa85f64-…" className="h-10" />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Semester (optional — blank = newest unpaid invoice)
          <Select value={form.semesterId} onValueChange={(v) => set("semesterId", (v ?? "") as typeof form.semesterId)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Any unpaid invoice" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Type
          <Select value={form.type} onValueChange={(v) => set("type", (v ?? "WAIVER") as typeof form.type)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["WAIVER", "SCHOLARSHIP", "DISCOUNT"] as const).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Name
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Merit scholarship" className="h-10" />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Percent (0–100, optional)
          <Input type="number" min={0} max={100} step="0.01" value={form.percent} onChange={(e) => set("percent", e.target.value)} placeholder="e.g. 25" className="h-10" />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Fixed amount ৳ (optional)
          <Input type="number" min={0} step="0.01" value={form.fixedAmount} onChange={(e) => set("fixedAmount", e.target.value)} placeholder="e.g. 5000" className="h-10" />
        </label>
      </div>
      <label className="grid gap-1 text-[13px] font-semibold">
        Reason (optional, saved to the audit trail)
        <Input value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Dean's list Spring 2026" className="h-10" />
      </label>
      <Button type="button" disabled={create.isPending} onClick={handleSubmit} className="sm:w-fit sm:px-8">
        {create.isPending ? "Applying…" : "Apply waiver now"}
      </Button>
    </div>
  );
}

export default function WaiversManager() {
  const [showForm, setShowForm] = useState(false);
  const query = useWaivers();
  const rows = query.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Waivers"
        subtitle="Discounts apply to the unpaid invoice immediately — later changes never touch old invoices."
        action={
          <Button type="button" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "New waiver"}
          </Button>
        }
      />

      {showForm ? (
        <DashboardPanel title="Apply a waiver">
          <WaiverCreateForm onDone={() => setShowForm(false)} />
        </DashboardPanel>
      ) : null}

      <DashboardPanel title="Applied waivers">
        {query.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-8 text-center text-sm">
            <p className="font-semibold">Could not load waivers.</p>
            <p className="text-[13px] text-muted-foreground">
              {getApiErrorMessage(query.error, "Try again in a moment.")}
            </p>
            <button type="button" onClick={() => query.refetch()} className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No waivers applied yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((w) => (
              <WaiverCard key={w.id} waiver={w} />
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  );
}
