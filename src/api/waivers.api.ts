import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// §9 — /waivers (ADMIN only). No waiver table exists, so creating applies
// the discount to the student's unpaid invoice right away (same rule as
// invoice adjustments) and every step is written to the audit log —
// GET reads that trail back. Later changes never touch old invoices.

export type WaiverType = "WAIVER" | "SCHOLARSHIP" | "DISCOUNT";

export interface Waiver {
  id: string; // audit row of the application — use it for PATCH /:id
  studentId: string;
  semesterId: string | null; // null = newest unpaid invoice at apply time
  type: WaiverType;
  name: string;
  percent: number | null;
  fixedAmount: number | null;
  amountApplied: number; // BDT actually cut from the invoice
  invoiceId: string;
  invoiceNumber: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  appliedBy: string;
  appliedAt: string;
  student?: {
    id: string;
    studentIdCode: string;
    user: { name: string; email: string };
  } | null;
}

export interface CreateWaiverPayload {
  studentId: string;
  semesterId?: string;
  type: WaiverType;
  name: string;
  // At least one of the two (percent wins when both are sent).
  percent?: number;
  fixedAmount?: number;
  validFrom?: string;
  validTo?: string;
  reason?: string;
}

export async function getWaivers() {
  const res = await apiClient<ApiResponse<Waiver[]>>("/waivers");
  return res.data ?? [];
}

// Applies NOW to the student's unpaid invoice — audited, immediate.
export async function createWaiver(payload: CreateWaiverPayload) {
  const res = await apiClient<ApiResponse<Waiver>>("/waivers", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

// Revoke (isActive: false) or move the expiry (validTo). Applied money
// never moves — revoking only stops future use of the record.
export async function updateWaiver(
  id: string,
  payload: { isActive?: boolean; validTo?: string | null },
) {
  const res = await apiClient<ApiResponse<Waiver>>(`/waivers/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}
