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
import { formatBDT } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  useCreateFeePolicy,
  useFeePolicyList,
  useSemesters,
  useUpdateFeePolicy,
} from "@/hooks";
import {
  FEE_CALC_METHODS,
  FEE_INVOICE_TYPES,
  FEE_ITEM_TYPES,
  type FeeCalcMethod,
  type FeeInvoiceType,
  type FeeItemType,
  type FeePolicyRow,
} from "@/api";

const inputClass = "h-10";

// The server accepts PER_CREDIT only for TUITION on SEMESTER invoices.
const perCreditAllowed = (invoiceType: string, itemType: string) =>
  invoiceType === "SEMESTER" && itemType === "TUITION";

const label = (v: string) =>
  v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");

// The items a first run needs before billing works at all (Task 41).
const RECOMMENDED: { name: string; invoiceType: FeeInvoiceType; itemType: FeeItemType; calcMethod: FeeCalcMethod; amount: number }[] = [
  { name: "Application fee", invoiceType: "APPLICATION", itemType: "APPLICATION", calcMethod: "FLAT", amount: 1000 },
  { name: "Admission fee", invoiceType: "ADMISSION", itemType: "ADMISSION", calcMethod: "FLAT", amount: 5000 },
  { name: "ID card fee", invoiceType: "ID_CARD", itemType: "ID_CARD", calcMethod: "FLAT", amount: 500 },
  { name: "Caution deposit", invoiceType: "SEMESTER", itemType: "CAUTION_DEPOSIT", calcMethod: "FLAT", amount: 2000 },
  { name: "Tuition per credit", invoiceType: "SEMESTER", itemType: "TUITION", calcMethod: "PER_CREDIT", amount: 1500 },
  { name: "Registration fee", invoiceType: "SEMESTER", itemType: "REGISTRATION", calcMethod: "FLAT", amount: 1000 },
  { name: "Laboratory fee", invoiceType: "SEMESTER", itemType: "LABORATORY", calcMethod: "FLAT", amount: 1000 },
  { name: "Examination fee", invoiceType: "SEMESTER", itemType: "EXAMINATION", calcMethod: "FLAT", amount: 1000 },
  { name: "Library fee", invoiceType: "SEMESTER", itemType: "LIBRARY", calcMethod: "FLAT", amount: 500 },
];

type Form = {
  name: string;
  invoiceType: FeeInvoiceType | "";
  itemType: FeeItemType | "";
  calcMethod: FeeCalcMethod;
  amount: string;
  isRefundable: boolean;
  semesterId: string;
  effectiveFrom: string;
  effectiveTo: string;
};

const EMPTY: Form = {
  name: "",
  invoiceType: "",
  itemType: "",
  calcMethod: "FLAT",
  amount: "",
  isRefundable: false,
  semesterId: "",
  effectiveFrom: "",
  effectiveTo: "",
};

function TextField({
  label: text,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-[13px] font-semibold">
      {text}
      <Input
        type={type ?? "text"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export default function FeePoliciesManager() {
  const [form, setForm] = useState<Form>({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const listQuery = useFeePolicyList();
  const semesters = useSemesters().data?.items ?? [];
  const create = useCreateFeePolicy();
  const update = useUpdateFeePolicy();
  const busy = create.isPending || update.isPending;
  const rows = listQuery.data ?? [];

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(row: FeePolicyRow) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      invoiceType: row.invoiceType,
      itemType: row.itemType,
      calcMethod: row.calcMethod,
      amount: String(row.amount),
      isRefundable: row.isRefundable,
      semesterId: row.semesterId ?? "",
      effectiveFrom: row.effectiveFrom ? row.effectiveFrom.slice(0, 10) : "",
      effectiveTo: row.effectiveTo ? row.effectiveTo.slice(0, 10) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY });
  }

  // Only name / amount / refundable / end-date / active are editable — a rate
  // change must never silently apply to already-issued invoices.
  function handleSave() {
    const amount = Number(form.amount);

    if (editingId) {
      if (form.name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
      if (!Number.isFinite(amount) || amount <= 0) return toast.error("Amount must be a positive number.");
      update.mutate(
        {
          id: editingId,
          payload: {
            name: form.name.trim(),
            amount,
            isRefundable: form.isRefundable,
            effectiveTo: form.effectiveTo ? new Date(form.effectiveTo).toISOString() : null,
          },
        },
        {
          onSuccess: () => {
            toast.success("Policy updated. Issued invoices keep their original amounts.");
            cancelEdit();
          },
          onError: (err) => toast.error(getApiErrorMessage(err, "Could not save.")),
        },
      );
      return;
    }

    if (form.name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
    if (!form.invoiceType) return toast.error("Choose an invoice type.");
    if (!form.itemType) return toast.error("Choose a fee item.");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Amount must be a positive number.");

    // Mirror the server's rules so the admin gets a clear message, not a 400.
    if (form.calcMethod === "PER_CREDIT" && !perCreditAllowed(form.invoiceType, form.itemType)) {
      return toast.error("Per-credit billing only applies to TUITION on SEMESTER invoices.");
    }

    create.mutate(
      {
        name: form.name.trim(),
        invoiceType: form.invoiceType,
        itemType: form.itemType,
        calcMethod: form.calcMethod,
        amount,
        isRefundable: form.isRefundable || form.itemType === "CAUTION_DEPOSIT",
        semesterId: form.semesterId || undefined,
        effectiveFrom: form.effectiveFrom ? new Date(form.effectiveFrom).toISOString() : undefined,
        effectiveTo: form.effectiveTo ? new Date(form.effectiveTo).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Policy created.");
          cancelEdit();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Could not create policy.")),
      },
    );
  }

  function quickAdd(rec: (typeof RECOMMENDED)[number]) {
    create.mutate(
      {
        name: rec.name,
        invoiceType: rec.invoiceType,
        itemType: rec.itemType,
        calcMethod: rec.calcMethod,
        amount: rec.amount,
        isRefundable: rec.itemType === "CAUTION_DEPOSIT",
      },
      {
        onSuccess: () => toast.success(`Created "${rec.name}".`),
        onError: (err) => toast.error(getApiErrorMessage(err, "Could not create policy.")),
      },
    );
  }

  // Billing is unusable until APPLICATION + ADMISSION + per-credit TUITION exist.
  const configured = new Set(rows.filter((r) => r.isActive).map((r) => r.itemType));
  const missing = RECOMMENDED.filter((r) => !configured.has(r.itemType));

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Fee policies"
        subtitle="Rate card — invoices snapshot these values, so later edits never rewrite issued invoices."
      />

      {rows.length === 0 && !listQuery.isLoading ? (
        <DashboardPanel title="Billing isn't configured yet">
          <p className="mb-3 text-[13px] text-muted-foreground">
            Without these policies there is no application fee, no admission invoice, and semester
            invoices fail with &quot;no fee configured&quot;.
          </p>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED.map((r) => (
              <Button key={r.itemType} size="sm" variant="outline" disabled={busy} onClick={() => quickAdd(r)}>
                {r.name}
              </Button>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      <DashboardPanel title={editingId ? "Edit policy" : "New policy"}>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Tuition per credit" />

          <label className="grid gap-1 text-[13px] font-semibold">
            Invoice type
            <Select
              value={form.invoiceType}
              disabled={editingId !== null}
              onValueChange={(v) => {
                const invoiceType = (v ?? "") as FeeInvoiceType | "";
                setForm((f) => ({
                  ...f,
                  invoiceType,
                  calcMethod: perCreditAllowed(invoiceType, f.itemType) ? f.calcMethod : "FLAT",
                }));
              }}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {FEE_INVOICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{label(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1 text-[13px] font-semibold">
            Fee item
            <Select
              value={form.itemType}
              disabled={editingId !== null}
              onValueChange={(v) => {
                const itemType = (v ?? "") as FeeItemType | "";
                setForm((f) => ({
                  ...f,
                  itemType,
                  calcMethod: perCreditAllowed(f.invoiceType, itemType) ? f.calcMethod : "FLAT",
                  isRefundable: itemType === "CAUTION_DEPOSIT" ? true : f.isRefundable,
                }));
              }}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {FEE_ITEM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{label(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1 text-[13px] font-semibold">
            Method
            <Select
              value={form.calcMethod}
              onValueChange={(v) => set("calcMethod", (v ?? "FLAT") as FeeCalcMethod)}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEE_CALC_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "PER_CREDIT" ? "Per credit" : "Flat"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <TextField
            label={form.calcMethod === "PER_CREDIT" ? "Rate per credit ৳" : "Amount ৳"}
            type="number"
            value={form.amount}
            onChange={(v) => set("amount", v)}
            placeholder="e.g. 1500"
          />

          <label className="grid gap-1 text-[13px] font-semibold">
            Semester (optional)
            <Select
              value={form.semesterId}
              disabled={editingId !== null}
              onValueChange={(v) => set("semesterId", v ?? "")}
            >
              <SelectTrigger className={`${inputClass} w-full`}>
                <SelectValue placeholder="All semesters" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {editingId ? (
            <>
              <TextField
                label="Effective to"
                type="date"
                value={form.effectiveTo}
                onChange={(v) => set("effectiveTo", v)}
              />
              <label className="grid items-end gap-1 text-[13px] font-semibold">
                <span className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.isRefundable}
                    onChange={(e) => set("isRefundable", e.target.checked)}
                  />
                  Refundable
                </span>
              </label>
            </>
          ) : (
            <>
              <TextField
                label="Effective from"
                type="date"
                value={form.effectiveFrom}
                onChange={(v) => set("effectiveFrom", v)}
              />
              <TextField
                label="Effective to"
                type="date"
                value={form.effectiveTo}
                onChange={(v) => set("effectiveTo", v)}
              />
              <label className="flex items-end gap-2 pb-2 text-[13px] font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.isRefundable || form.itemType === "CAUTION_DEPOSIT"}
                  disabled={form.itemType === "CAUTION_DEPOSIT"}
                  onChange={(e) => set("isRefundable", e.target.checked)}
                />
                Refundable
              </label>
            </>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Precedence: semester+department &gt; semester &gt; department &gt; global; the latest
          effectiveFrom wins.
        </p>

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

      {missing.length > 0 && rows.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Still missing: {missing.map((m) => m.name).join(", ")}. Add them from the button above.
        </p>
      ) : null}

      <DashboardPanel title="Saved policies">
        {listQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : listQuery.isError ? (
          <div className="py-8 text-center text-sm">
            <p className="font-semibold">Could not load policies.</p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No policies yet — create one above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell className="text-[13px]">{label(r.invoiceType)}</TableCell>
                  <TableCell className="text-[13px]">
                    {label(r.itemType)}
                    {r.isRefundable ? (
                      <Badge variant="secondary" className="ml-2">Refundable</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {r.calcMethod === "PER_CREDIT" ? "Per credit" : "Flat"}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatBDT(r.amount)}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {r.semester?.name ?? "All semesters"}
                    {r.department ? ` · ${r.department.code}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.isActive ? "success" : "secondary"}>
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          update.mutate(
                            { id: r.id, payload: { isActive: !r.isActive } },
                            {
                              onSuccess: () => toast.success(r.isActive ? "Policy deactivated." : "Policy activated."),
                              onError: (err) => toast.error(getApiErrorMessage(err, "Could not update.")),
                            },
                          )
                        }
                        className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
                      >
                        {r.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
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