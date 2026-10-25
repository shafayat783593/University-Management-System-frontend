import type {
  ApiResponse,
  BkashInitResult,
  StudentFee,
} from "@/components/types";
import apiClient, { downloadBlobFile } from "@/lib/apiClient";

/* Legacy installment-keyed flow (current pages use it — kept working) --- */

export async function getMyFees() {
  const res = await apiClient<ApiResponse<StudentFee[]>>("/payments/my-fees");
  return res.data ?? [];
}

// POST /payments/bkash/init { installmentId } → { bkashURL }.
export async function initBkashPayment(installmentId: string) {
  const res = await apiClient<ApiResponse<BkashInitResult>>(
    "/payments/bkash/init",
    { method: "POST", body: { installmentId } },
  );
  return res.data;
}

// PATCH /payments/:installmentId/cancel — PAID, non-ADMISSION only.
export async function cancelFeePayment(installmentId: string) {
  const res = await apiClient<ApiResponse<unknown>>(
    `/payments/${installmentId}/cancel`,
    { method: "PATCH" },
  );
  return res.data;
}



// POST /payments/init { invoiceId, amount? } → bKash redirect info.
// amount omitted = first unpaid installment in full; given = must equal it
// exactly (no partial payments) and never exceed the outstanding balance.
export interface InitPaymentResult {
  transactionId: string;
  paymentID: string;
  bkashURL: string;
  amount: number;
}

export async function initPayment(payload: { invoiceId: string; amount?: number }) {
  const res = await apiClient<ApiResponse<InitPaymentResult>>("/payments/init", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export type TransactionStatus =
  | "INITIATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  gateway: string;
  gatewayPaymentId: string;
  gatewayTrxId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  excessAmount: number;
  refundedAmount: number;
  receiptNumber: string;
  failureReason: string | null;
  initiatedAt: string;
  completedAt: string | null;
  invoice: {
    id: string;
    invoiceNumber: string | null;
    type: string;
    status: string;
  };
}

// GET /payments/my — my transactions, newest first, paginated.
export async function getMyTransactions(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiClient<ApiResponse<PaymentTransaction[]>>(
    `/payments/my${qs ? `?${qs}` : ""}`,
  );
}

// GET /payments/:id — own transactions for students (else 404).
export async function getTransactionById(id: string) {
  const res = await apiClient<ApiResponse<PaymentTransaction>>(`/payments/${id}`);
  return res.data;
}

export interface CollectionReport {
  totals: { collected: number; refunded: number; count: number; net: number };
  bySemester: { semester: string; collected: number; refunded: number; count: number; net: number }[];
  byDepartment: { department: string; collected: number; refunded: number; count: number; net: number }[];
}

// GET /payments/reports/collection (ADMIN).
export async function getCollectionReport(params?: {
  from?: string;
  to?: string;
  semesterId?: string;
  departmentId?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  const res = await apiClient<ApiResponse<CollectionReport>>(
    `/payments/reports/collection${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

// POST /payments/:id/refund (ADMIN). amount omitted = everything refundable.
// reverseCharge (default true) reopens the dues; false just sends money back.
export async function refundPayment(
  id: string,
  payload: { amount?: number; reason: string; reverseCharge?: boolean },
) {
  const res = await apiClient<ApiResponse<{ transaction: PaymentTransaction; refundedAmount: number; reopenedDues: boolean }>>(
    `/payments/${id}/refund`,
    { method: "POST", body: payload },
  );
  return res.data;
}

// GET /payments/:id/receipt — PDF (SUCCESS or REFUNDED only).
// Uses the shared apiClient so cookies + baseURL stay correct.
export function downloadTransactionReceipt(id: string, filename: string) {
  return downloadBlobFile(`/payments/${id}/receipt`, filename);
}

// GET /payments/bkash/callback?paymentID=&status= — backend returns JSON (§2),
// never a redirect. Frontend /payment/callback page calls this.
export interface BkashCallbackResult {
  success: boolean;
  message: string;
  transactionId?: string | null;
  receiptNumber?: string | null;
  payment?: unknown;
}

export async function bkashCallback(paymentID: string, status: string) {
  const res = await apiClient<ApiResponse<BkashCallbackResult>>(
    `/payments/bkash/callback?paymentID=${encodeURIComponent(paymentID)}&status=${encodeURIComponent(status)}`,
  );
  return res.data;
}

// POST /payments/:id/verify — idempotent retry when callback breaks (§2).
export async function verifyPayment(id: string) {
  const res = await apiClient<ApiResponse<BkashCallbackResult>>(
    `/payments/${id}/verify`,
    { method: "POST" },
  );
  return res.data;
}

// GET /payments/receipts/:paymentId — PDF download (PAID only).
export function downloadReceiptPdf(paymentId: string, filename: string) {
  return downloadBlobFile(`/payments/receipts/${paymentId}`, filename);
}
