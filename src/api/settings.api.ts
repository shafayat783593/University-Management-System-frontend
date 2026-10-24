import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// §4: GET /settings is public. Response data:
// { id, applicationFeeRequired, admissionPaymentRequiredToEnroll, updatedAt,
//   ...legacy amount columns }.
export interface SystemSettings {
  id: string;
  applicationFeeRequired: boolean;
  admissionPaymentRequiredToEnroll: boolean;
  universityName: string;
  idCardValidityYears: number;
  applicationFeeAmount?: number | null;
  admissionFeeAmount?: number | null;
  admissionInstallmentCount?: number;
  updatedAt: string;
}

export async function getSettings() {
  const res = await apiClient<ApiResponse<SystemSettings>>("/settings");
  return res.data;
}

// PATCH /settings (ADMIN) — at least one flag per call.
export async function updateSettings(payload: {
  applicationFeeRequired?: boolean;
  admissionPaymentRequiredToEnroll?: boolean;
  universityName?: string;
  idCardValidityYears?: number;
}) {
  const res = await apiClient<ApiResponse<SystemSettings>>("/settings", {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}
