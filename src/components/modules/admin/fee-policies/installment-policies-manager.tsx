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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT, formatDueDate } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  useCreateInstallmentPolicy,
  useInstallmentPolicyList,
  useSemesters,
  useUpdateInstallmentPolicy,
} from "@/hooks";
import type { InstallmentPolicy } from "@/api";

const inputClass = "h-10";

const ADVANCE_TYPES = ["NONE", "PERCENT", "FIXED"] as const;
const LATE_FEE_TYPES = ["NONE", "FIXED", "PERCENT"] as const;

type AdvanceType = (typeof ADVANCE_TYPES)[number];
type LateFeeType = (typeof LATE_FEE_TYPES)[number];

function NumField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <label className="grid gap-1 text-[13px] font-semibold">
      {label}
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

type Form = {
  name: string;
  isDefault: boolean;
  semesterId: string;
  installmentCount: string;
  advanceType: AdvanceType;
  advanceValue: string;
  intervalMonths: string;
  firstDueDate: string;
  firstDueOffsetDays: string;
  graceDays: string;
  lateFeeType: LateFeeType;
  lateFeeValue: string;
  allowPartialPayment: boolean;
  restrictOnOverdue: boolean;
};

const EMPTY: Form = {
  name: "",
  isDefault: true,
  semesterId: "",
  installmentCount: "3",
  advanceType: "NONE",
  advanceValue: "",
  intervalMonths: "1",
  firstDueDate: "",
  firstDueOffsetDays: "7",
  graceDays: "3",
  lateFeeType: "NONE",
  lateFeeValue: "0",
  allowPartialPayment: false,
  restrictOnOverdue: true,
};

export default function InstallmentPoliciesManager() {
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const listQuery = useInstallmentPolicyList();
  const semesters = useSemesters().data?.items ?? [];
  const create = useCreateInstallmentPolicy();
  const update = useUpdateInstallmentPolicy();
  const busy = create.isPending || update.isPending;
  const rows = listQuery.data ?? [];

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(row: InstallmentPolicy) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      isDefault: row.isDefault,
      semesterId: row.semesterId ?? "",
      installmentCount: String(row.installmentCount),
      advanceType: row.advanceType,
      advanceValue: row.advanceValue == null ? "" : String(row.advanceValue),
      intervalMonths: String(row.intervalMonths),
      firstDueDate: row.firstDueDate ? row.firstDueDate.slice(0, 10) : "",
      firstDueOffsetDays: String(row.firstDueOffsetDays),
      graceDays: String(row.graceDays),
      lateFeeType: row.lateFeeType,
      lateFeeValue: String(row.lateFeeValue),
      allowPartialPayment: row.allowPartialPayment,
      restrictOnOverdue: row.restrictOnOverdue,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY });
  }

  const count = Number(form.installmentCount);
  const advanceValue =
    form.advanceValue.trim() === "" ? undefined : Number(form.advanceValue);
  const lateFeeValue = form.lateFeeValue.trim() === "" ? 0 : Number(form.lateFeeValue);

  function handleSave() {
    if (form.name.trim().length < 2) return toast.error("Name must be at least 2 characters.");

    // The server enforces "exactly one of" — mirror it so the admin sees why.
    if (!editingId && !form.isDefault && !form.semesterId) {
      return toast.error("Choose either the default scope or a specific semester.");
    }

    if (!Number.isInteger(count) || count < 1 || count > 24) {
      return toast.error("Installment count must be between 1 and 24.");
    }
    if (form.advanceType === "FIXED" && !advanceValue) {
      return toast.error("An advance amount is required for a fixed advance.");
    }
    if (form.advanceType === "PERCENT" && (advanceValue == null || advanceValue <= 0 || advanceValue >= 100)) {
      return toast.error("An advance percentage must be between 0 and 100.");
    }

    const payload = {
      name: form.name.trim(),
      isDefault: form.isDefault,
      semesterId: form.isDefault ? undefined : form.semesterId || undefined,
      installmentCount: count,
      advanceType: form.advanceType,
      advanceValue: form.advanceType === "NONE" ? undefined : advanceValue,
      intervalMonths: Number(form.intervalMonths) || 1,
      firstDueDate: form.firstDueDate ? new Date(form.firstDueDate).toISOString() : undefined,
      firstDueOffsetDays: Number(form.firstDueOffsetDays) || 0,
      graceDays: Number(form.graceDays) || 0,
      lateFeeType: form.lateFeeType,
      lateFeeValue,
      allowPartialPayment: form.allowPartialPayment,
      restrictOnOverdue: form.restrictOnOverdue,
    };

    if (editingId) {
      update.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            toast.success("Plan updated. Issued invoices keep their original schedule.");
            cancelEdit();
          },
          onError: (err) => toast.error(getApiErrorMessage(err, "Could not save.")),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Plan saved.");
          cancelEdit();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Could not save.")),
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Installment policies"
        subtitle="How an invoice is split into parts — students never choose the count."
      />

      <DashboardPanel title={editingId ? "Edit policy" : "New policy"}>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-[13px] font-semibold">
            Name
            <Input
              value={form.name}
              placeholder="e.g. Standard 3-part plan"
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="grid gap-1 text-[13px] font-semibold">
            Scope
            <Select
              value={form.isDefault ? "default" : form.semesterId || "none"}
              disabled={editingId !== null}
              onValueChange={(v) => {
                const next = v ?? "";
                if (next === "default") setForm((f) => ({ ...f, isDefault: true, semesterId: "" }));
                else setForm((f) => ({ ...f, isDefault: false, semesterId: next === "none" ? "" : next }));
              }}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default for all semesters</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <NumField
            label="Installments (1–24)"
            value={form.installmentCount}
            onChange={(v) => set("installmentCount", v)}
            min={1}
            max={24}
          />

          <NumField
            label="Interval (months)"
            value={form.intervalMonths}
            onChange={(v) => set("intervalMonths", v)}
            min={1}
            max={12}
          />

          <label className="grid gap-1 text-[13px] font-semibold">
            First due date
            <Input
              type="date"
              value={form.firstDueDate}
              onChange={(e) => set("firstDueDate", e.target.value)}
              className={inputClass}
            />
          </label>

          <NumField
            label="Or first due in (days)"
            value={form.firstDueOffsetDays}
            onChange={(v) => set("firstDueOffsetDays", v)}
            min={0}
            max={120}
          />

          <NumField
            label="Grace days"
            value={form.graceDays}
            onChange={(v) => set("graceDays", v)}
            min={0}
            max={90}
          />

          <label className="grid gap-1 text-[13px] font-semibold">
            Advance
            <Select
              value={form.advanceType}
              onValueChange={(v) => set("advanceType", (v ?? "NONE") as AdvanceType)}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                <SelectItem value="PERCENT">Percent</SelectItem>
                <SelectItem value="FIXED">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </label>

          {form.advanceType !== "NONE" ? (
            <NumField
              label={form.advanceType === "PERCENT" ? "Advance %" : "Advance ৳"}
              value={form.advanceValue}
              onChange={(v) => set("advanceValue", v)}
              step={form.advanceType === "PERCENT" ? "0.01" : undefined}
            />
          ) : null}

          <label className="grid gap-1 text-[13px] font-semibold">
            Late fee type
            <Select
              value={form.lateFeeType}
              onValueChange={(v) => set("lateFeeType", (v ?? "NONE") as LateFeeType)}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                <SelectItem value="FIXED">Fixed ৳</SelectItem>
                <SelectItem value="PERCENT">Percent</SelectItem>
              </SelectContent>
            </Select>
          </label>

          {form.lateFeeType !== "NONE" ? (
            <NumField
              label={form.lateFeeType === "PERCENT" ? "Late fee %" : "Late fee ৳"}
              value={form.lateFeeValue}
              onChange={(v) => set("lateFeeValue", v)}
              step={form.lateFeeType === "PERCENT" ? "0.01" : undefined}
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.allowPartialPayment}
              onChange={(e) => set("allowPartialPayment", e.target.checked)}
            />
            Allow partial payment
          </label>
          <label className="flex items-center gap-2 text-[13px] font-semibold">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.restrictOnOverdue}
              onChange={(e) => set("restrictOnOverdue", e.target.checked)}
            />
            Block enroll / results / ID card while overdue
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="button" disabled={busy} onClick={handleSave}>
            {busy ? "Saving…" : editingId ? "Save changes" : "Create policy"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          ) : null}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Saved policies">
        {listQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : listQuery.isError ? (
          <div className="py-8 text-center text-sm">
            <p className="font-semibold">Could not load policies.</p>
            <button type="button" onClick={() => listQuery.refetch()} className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No policies yet — semester invoices need one to build a schedule.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>First due</TableHead>
                <TableHead>Grace / late</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {r.isDefault ? "All semesters" : (r.semester?.name ?? "—")}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {r.installmentCount} × {r.intervalMonths}mo
                    {r.advanceType !== "NONE" ? (
                      <Badge variant="secondary" className="ml-2">
                        {r.advanceType === "PERCENT"
                          ? `${r.advanceValue}% advance`
                          : `${formatBDT(r.advanceValue ?? 0)} advance`}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {formatDueDate(r.firstDueDate) ?? `+${r.firstDueOffsetDays}d`}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {r.graceDays}d ·{" "}
                    {r.lateFeeType === "NONE"
                      ? "no late fee"
                      : r.lateFeeType === "PERCENT"
                        ? `${r.lateFeeValue}%`
                        : formatBDT(r.lateFeeValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.allowPartialPayment ? (
                        <Badge variant="secondary">partial</Badge>
                      ) : (
                        <Badge variant="outline">in full</Badge>
                      )}
                      {r.restrictOnOverdue ? (
                        <Badge variant="warning">restricted</Badge>
                      ) : (
                        <Badge variant="outline">open</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.isActive ? "success" : "secondary"}>
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
                    >
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardPanel>
    </div>
  );
}