import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// Task 13 — /admission-applications (Phase B).
// Status word is SUBMITTED (not PENDING). Rejection text is rejectionReason.
// testScore / testDate / applicationFeeTrxId no longer exist.

export type AdmissionStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

export interface AdmissionApplication {
  id: string;
  studentId: string;
  previousInstitution: string;
  sscBoard?: string | null;
  sscYear?: number | null;
  sscGpa?: number | null;
  hscBoard?: string | null;
  hscYear?: number | null;
  hscGpa?: number | null;
  guardianOccupation?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  status: AdmissionStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
}

export interface AdmissionMiniInvoice {
  id: string;
  invoiceNumber: string | null;
  status: string;
  payableAmount: number;
  paidAmount: number;
  /** Server-derived — never compute this on the client (§5). */
  outstandingBalance: number;
}

// GET /admission-applications/me — null when never submitted.
export interface MyAdmission {
  application: AdmissionApplication | null;
  applicationFee: { required: boolean; amount: number; isPaid: boolean };
  applicationInvoice: AdmissionMiniInvoice | null;
  admissionInvoice: AdmissionMiniInvoice | null;
  admissionConfirmed: boolean;
  studentIdCode: string | null;
}

export interface AdmissionApplicationPayload {
  previousInstitution: string;
  sscBoard?: string;
  sscYear?: number;
  sscGpa?: number;
  hscBoard?: string;
  hscYear?: number;
  hscGpa?: number;
  guardianOccupation?: string;
  presentAddress?: string;
  permanentAddress?: string;
}

export async function getMyAdmissionApplication() {
  const res = await apiClient<ApiResponse<MyAdmission | null>>(
    "/admission-applications/me",
  );
  return res.data ?? null;
}

// POST — first-time submit (402 = fee unpaid, 409 = already submitted).
export async function submitAdmissionApplication(
  payload: AdmissionApplicationPayload,
) {
  const res = await apiClient<ApiResponse<AdmissionApplication>>(
    "/admission-applications",
    { method: "POST", body: payload },
  );
  return res.data;
}

// PATCH — edit while SUBMITTED, or re-submit after REJECTED.
export async function updateAdmissionApplication(
  payload: AdmissionApplicationPayload,
) {
  const res = await apiClient<ApiResponse<AdmissionApplication>>(
    "/admission-applications",
    { method: "PATCH", body: payload },
  );
  return res.data;
}

/* Admin review queue -------------------------------------------- */

export interface AdmissionListRow extends AdmissionApplication {
  student: {
    studentIdCode: string;
    department: { name: string; code: string };
    user: { name: string; email: string };
  };
}

export async function getAdmissionApplications(status?: string) {
  const qs = status && status !== "ALL" ? `?status=${status}` : "";
  const res = await apiClient<ApiResponse<AdmissionListRow[]>>(
    `/admission-applications${qs}`,
  );
  console.log("getAdmissionApplications res", res.data);
  return res.data;
}

export interface ReviewAdmissionPayload {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string; // required when REJECTED (min 5 chars)
}

export interface ReviewAdmissionResult {
  applicationId: string;
  status: "APPROVED" | "REJECTED";
  admissionInvoiceId: string | null;
  admissionConfirmed: boolean;
}

export async function reviewAdmissionApplication(
  id: string,
  payload: ReviewAdmissionPayload,
) {
  const res = await apiClient<ApiResponse<ReviewAdmissionResult>>(
    `/admission-applications/${id}/review`,
    { method: "PATCH", body: payload },
  );
  return res.data;
}
