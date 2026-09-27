import { ChangePasswordPayload, LoginPayload, MeUser, RegistrationPayload, UpdateStudentProfilePayload, VerifyAccountPayload } from "@/components/types/auth.type";
import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";



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