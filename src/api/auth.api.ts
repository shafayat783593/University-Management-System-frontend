import type { ApiResponse } from "@/components/types/api";
import type {
  ChangePasswordPayload,
  CompleteProfilePayload,
  LoginPayload,
  MeUser,
  RegistrationPayload,
  UpdateStudentProfilePayload,
  VerifyAccountPayload,
} from "@/components/types/auth.type";
import apiClient, { downloadBlobFile } from "@/lib/apiClient";

export function userLogin(payload: LoginPayload) {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

export function userRegistration(payload: RegistrationPayload) {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

export function userLogout() {
  return apiClient("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient<ApiResponse<MeUser>>("/auth/me");
}

export function googleOAuth(payload: { idToken: string }) {
  return apiClient("/auth/google", { method: "POST", body: payload });
}

export function updateProfileImage(image: File) {
  const body = new FormData();
  body.append("image", image);
  return apiClient<ApiResponse<MeUser>>("/auth/profile-image", {
    method: "PATCH",
    body,
  });
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiClient("/auth/change-password", { method: "PATCH", body: payload });
}

export function updateStudentProfile(payload: UpdateStudentProfilePayload) {
  return apiClient("/auth/student-profile", { method: "PATCH", body: payload });
}

export function completeProfile(payload: CompleteProfilePayload) {
  return apiClient<ApiResponse<MeUser>>("/auth/complete-profile", {
    method: "POST",
    body: payload,
  });
}

export function downloadIdCardPdf(studentIdCode: string) {
  return downloadBlobFile("/auth/id-card", `id-card-${studentIdCode}.pdf`);
}

/* ---------------- ID card ---------------- */

export type IdCardFeeStatus =
  | "NOT_REQUIRED" // the university charges nothing for the card
  | "NOT_INVOICED" // a fee applies but the student has not been billed yet
  | "UNPAID" // an invoice exists and still owes money
  | "PAID";

export interface IdCardFeeState {
  required: boolean;
  status: IdCardFeeStatus;
  amountDue: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
}

export interface IdCardStatus {
  admissionConfirmed: boolean;
  studentIdCode: string | null;
  departmentName: string;
  universityName: string;
  fee: IdCardFeeState;
  canDownload: boolean;
  profile: {
    complete: boolean;
    missing: string[];
    dateOfBirth: string | null;
    bloodGroup: string | null;
    address: string | null;
    guardianName: string | null;
    hasPhoto: boolean;
  };
}

// GET /auth/id-card/status — can the card be downloaded, and what is missing?
export function getIdCardStatus() {
  return apiClient<ApiResponse<IdCardStatus>>("/auth/id-card/status");
}
