import type { ApiResponse, Enrollment } from "@/components/types";
import apiClient from "@/lib/apiClient";

export async function createEnrollment(payload: { sectionId: string }) {
  const res = await apiClient<ApiResponse<Enrollment>>("/enrollments", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function getMyEnrollments() {
  const res = await apiClient<ApiResponse<Enrollment[]>>("/enrollments/my");
  return res.data ?? [];
}

export async function dropEnrollment(sectionId: string) {
  const res = await apiClient<ApiResponse<Enrollment>>(
    `/enrollments/${sectionId}`,
    { method: "DELETE" },
  );
  return res.data;
}

export async function withdrawEnrollment(sectionId: string) {
  const res = await apiClient<ApiResponse<Enrollment>>(
    `/enrollments/${sectionId}/withdraw`,
    { method: "PATCH" },
  );
  return res.data;
}
