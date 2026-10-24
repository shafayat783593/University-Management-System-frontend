import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// §8 / Task 41 — /fee-policies. One row per (itemType, scope), NOT per semester:
// billing reads these to build invoice line items. Rates are snapshotted onto
// each invoice, so editing a policy never rewrites an issued invoice.

export const FEE_INVOICE_TYPES = [
  "APPLICATION",
  "ADMISSION",
  "SEMESTER",
  "ID_CARD",
] as const;
export type FeeInvoiceType = (typeof FEE_INVOICE_TYPES)[number];

export const FEE_ITEM_TYPES = [
  "APPLICATION",
  "ADMISSION",
  "ID_CARD",
  "CAUTION_DEPOSIT",
  "TUITION",
  "REGISTRATION",
  "LABORATORY",
  "EXAMINATION",
  "LIBRARY",
  "LATE_FEE",
  "OTHER",
] as const;
export type FeeItemType = (typeof FEE_ITEM_TYPES)[number];

export const FEE_CALC_METHODS = ["FLAT", "PER_CREDIT"] as const;
export type FeeCalcMethod = (typeof FEE_CALC_METHODS)[number];

export interface FeePolicyRow {
  id: string;
  name: string;
  invoiceType: FeeInvoiceType;
  itemType: FeeItemType;
  calcMethod: FeeCalcMethod;
  amount: number;
  isRefundable: boolean;
  isActive: boolean;
  departmentId: string | null;
  semesterId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  department: { name: string; code: string } | null;
  semester: { name: string } | null;
}

export interface CreateFeePolicyPayload {
  name: string;
  invoiceType: FeeInvoiceType;
  itemType: FeeItemType;
  calcMethod: FeeCalcMethod;
  amount: number;
  isRefundable?: boolean;
  departmentId?: string;
  semesterId?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// Rates are append-only in spirit — to change a rate on a date, create a new
// policy with a later effectiveFrom and set effectiveTo on the old one.
export interface UpdateFeePolicyPayload {
  name?: string;
  amount?: number;
  isRefundable?: boolean;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface FeePolicyFilters {
  invoiceType?: FeeInvoiceType;
  departmentId?: string;
  semesterId?: string;
  activeOnly?: boolean;
}

export async function getFeePolicies(filters?: FeePolicyFilters) {
  const q = new URLSearchParams();
  if (filters?.invoiceType) q.set("invoiceType", filters.invoiceType);
  if (filters?.departmentId) q.set("departmentId", filters.departmentId);
  if (filters?.semesterId) q.set("semesterId", filters.semesterId);
  if (filters?.activeOnly) q.set("activeOnly", "true");
  const qs = q.toString();
  const res = await apiClient<ApiResponse<FeePolicyRow[]>>(`/fee-policies${qs ? `?${qs}` : ""}`);
  return res.data ?? [];
}

export async function createFeePolicy(payload: CreateFeePolicyPayload) {
  const res = await apiClient<ApiResponse<FeePolicyRow>>("/fee-policies", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateFeePolicy(id: string, payload: UpdateFeePolicyPayload) {
  const res = await apiClient<ApiResponse<FeePolicyRow>>(`/fee-policies/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

/* Installment policies ------------------------------------------ */

export interface InstallmentPolicy {
  id: string;
  name: string;
  semesterId: string | null;
  isDefault: boolean;
  isActive: boolean;
  installmentCount: number;
  advanceType: "NONE" | "PERCENT" | "FIXED";
  advanceValue: number | null;
  customPercents: number[] | null;
  intervalMonths: number;
  firstDueDate: string | null;
  firstDueOffsetDays: number;
  graceDays: number;
  lateFeeType: "NONE" | "FIXED" | "PERCENT";
  lateFeeValue: number;
  allowPartialPayment: boolean;
  restrictOnOverdue: boolean;
  semester: { name: string } | null;
}

export interface InstallmentPolicyPayload {
  name: string;
  isDefault: boolean;
  semesterId?: string;
  installmentCount?: number;
  advanceType?: "NONE" | "PERCENT" | "FIXED";
  advanceValue?: number;
  customPercents?: number[];
  intervalMonths?: number;
  firstDueDate?: string;
  firstDueOffsetDays?: number;
  graceDays?: number;
  lateFeeType?: "NONE" | "FIXED" | "PERCENT";
  lateFeeValue?: number;
  allowPartialPayment?: boolean;
  restrictOnOverdue?: boolean;
  isActive?: boolean;
}

export async function getInstallmentPolicies() {
  const res = await apiClient<ApiResponse<InstallmentPolicy[]>>(
    "/fee-policies/installment-policies",
  );
  return res.data ?? [];
}

// Exactly one of isDefault: true or semesterId — the server enforces it.
export async function createInstallmentPolicy(payload: InstallmentPolicyPayload) {
  const res = await apiClient<ApiResponse<InstallmentPolicy>>(
    "/fee-policies/installment-policies",
    { method: "POST", body: payload },
  );
  return res.data;
}

export async function updateInstallmentPolicy(id: string, payload: Partial<InstallmentPolicyPayload>) {
  const res = await apiClient<ApiResponse<InstallmentPolicy>>(
    `/fee-policies/installment-policies/${id}`,
    { method: "PATCH", body: payload },
  );
  return res.data;
}