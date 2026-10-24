import type { ApiResponse, Meta } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// §6 — /invoices. Money is always number (BDT); never compute amounts here
// to send to the server — the server decides every taka.

export type InvoiceType =
  | "APPLICATION"
  | "ADMISSION"
  | "SEMESTER"
  | "ID_CARD";
export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
export type InstallmentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export interface InvoiceItem {
  id: string;
  itemType: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  isRefundable: boolean;
}

export interface InvoiceAdjustment {
  id: string;
  type: string;
  amount: number;
  reason: string;
}

export interface InvoiceInstallment {
  id: string;
  number: number;
  amount: number;
  paidAmount: number;
  remaining: number;
  dueDate: string;
  status: InstallmentStatus;
  isOverdue: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string | null;
  type: InvoiceType;
  status: InvoiceStatus;
  studentId: string;
  semesterId: string | null;
  subtotal: number;
  discountTotal: number;
  adjustmentTotal: number;
  payableAmount: number;
  paidAmount: number;
  refundedAmount: number;
  outstandingBalance: number;
  allowPartialPayment: boolean;
  issueDate: string;
  dueDate: string | null;
  items: InvoiceItem[];
  adjustments: InvoiceAdjustment[];
  installments: InvoiceInstallment[];
}

export interface InvoiceTransaction {
  id: string;
  amount: number;
  status: string;
  receiptNumber: string;
  completedAt: string | null;
  initiatedAt: string;
  refundedAmount: number;
}

export type InvoiceDetail = Invoice & { transactions: InvoiceTransaction[] };

export interface OverdueInstallment {
  invoiceId: string;
  invoiceNumber: string | null;
  installmentId: string;
  number: number;
  dueDate: string;
  remaining: number;
}

export interface InvoiceSummary {
  totalFees: number;
  totalPaid: number;
  outstandingBalance: number;
  nextInstallment: OverdueInstallment | null;
  overdueInstallments: OverdueInstallment[];
  invoiceCount: number;
}

/* Student ------------------------------------------------------ */

// Idempotent: returns the previous application invoice when one exists.
export async function createApplicationInvoice() {
  const res = await apiClient<ApiResponse<Invoice>>("/invoices/application", {
    method: "POST",
  });
  return res.data;
}

// The one-off ID card charge. 409 when the university does not charge for
// the card, or when the student already has that invoice.
export async function createIdCardInvoice() {
  const res = await apiClient<ApiResponse<Invoice>>("/invoices/id-card", {
    method: "POST",
  });
  return res.data;
}

// One invoice for my own enrolled credits in a semester (403 until admitted).
export async function generateMySemesterInvoice(semesterId: string) {
  const res = await apiClient<ApiResponse<Invoice>>(
    "/invoices/semester/generate-my",
    { method: "POST", body: { semesterId } },
  );
  return res.data;
}

export async function getMyInvoices(params?: {
  type?: string;
  status?: string;
  semesterId?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString();
  const res = await apiClient<ApiResponse<Invoice[]>>(
    `/invoices/my${qs ? `?${qs}` : ""}`,
  );
  return res.data ?? [];
}

// "Pay now" target: nextInstallment (or the first overdue one).
export async function getMyInvoiceSummary() {
  const res = await apiClient<ApiResponse<InvoiceSummary>>("/invoices/my/summary");
  return res.data;
}

export async function getMyOverdueInstallments() {
  const res = await apiClient<ApiResponse<OverdueInstallment[]>>(
    "/invoices/my/overdue",
  );
  return res.data ?? [];
}

// Own invoices only — anyone else's id is a 404.
export async function getInvoiceById(id: string) {
  const res = await apiClient<ApiResponse<InvoiceDetail>>(`/invoices/${id}`);
  return res.data;
}

/* Admin -------------------------------------------------------- */

export interface BulkGenerateResult {
  created: { studentId: string; invoiceId: string }[];
  supplementary: unknown[];
  skipped: string[];
  failed: unknown[];
}

// Bulk for a semester, or one student when studentId is given.
export async function generateSemesterInvoices(payload: {
  semesterId: string;
  studentId?: string;
}) {
  const res = await apiClient<ApiResponse<BulkGenerateResult>>(
    "/invoices/semester/generate",
    { method: "POST", body: payload },
  );
  return res.data;
}

export async function getAllInvoices(params?: {
  status?: string;
  type?: string;
  semesterId?: string;
  studentId?: string;
  departmentId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  // The server nests the page one level deeper: data = { data, meta }.
  // Normalise here so callers get a flat array + pagination meta.
  const res = await apiClient<ApiResponse<{ data?: Invoice[]; meta?: Meta }>>(
    `/invoices${qs ? `?${qs}` : ""}`,
  );
  const body = res.data;
  return {
    items: body?.data ?? [],
    meta: body?.meta ?? res.meta,
  };
}

export interface OutstandingRow {
  studentId: string;
  name: string;
  email: string;
  studentIdCode: string;
  department: string;
  invoices: number;
  outstanding: number;
}

export async function getOutstandingReport(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiClient<ApiResponse<OutstandingRow[]>>(
    `/invoices/reports/outstanding${qs ? `?${qs}` : ""}`,
  );
}

export async function getOverdueReport() {
  const res = await apiClient<ApiResponse<OverdueInstallment[]>>(
    "/invoices/reports/overdue",
  );
  return res.data ?? [];
}

// Manual late-fee run (there is no cron).
export async function applyLateFees() {
  const res = await apiClient<ApiResponse<{ appliedCount: number; totalLateFees: number }>>(
    "/invoices/late-fees/apply",
    { method: "POST" },
  );
  return res.data;
}

// WAIVER/SCHOLARSHIP/DISCOUNT take a positive amount (applied as a cut);
// ADJUSTMENT takes a signed one; zero is rejected.
export async function addInvoiceAdjustment(
  id: string,
  payload: { type: "WAIVER" | "SCHOLARSHIP" | "DISCOUNT" | "ADJUSTMENT"; amount: number; reason: string },
) {
  const res = await apiClient<ApiResponse<{ adjustment: InvoiceAdjustment; invoice: Invoice }>>(
    `/invoices/${id}/adjustments`,
    { method: "POST", body: payload },
  );
  return res.data;
}

export async function cancelInvoice(id: string, reason: string) {
  const res = await apiClient<ApiResponse<Invoice>>(`/invoices/${id}/cancel`, {
    method: "POST",
    body: { reason },
  });
  return res.data;
}
