import {
  ApiResponse,
  VerifyAccountPayload,
 GetInstructorApplicationsParams,
   InstructorApplication,
  ReviewInstructorPayload,
  ApplyAsInstructorPayload
} from "@/components/types";
import apiClient from "@/lib/apiClient";


export function applyAsInstructor({ resume, ...data }: ApplyAsInstructorPayload) {
  const body = new FormData();
  body.append("name", data.name.trim());
  body.append("email", data.email.trim().toLowerCase());
  body.append("departmentId", data.departmentId);
  if (data.qualification.trim()) body.append("qualification", data.qualification.trim());
  body.append("resume", resume);
  return apiClient("/instructors/apply", { method: "POST", body });
}



export const verifyInstructorEmailVerify = (payload: VerifyAccountPayload) => {
  return apiClient("instructors/verify-email", { method: "POST", body: payload })

}



export function getAllInstructorApplications(params: GetInstructorApplicationsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.searchTerm) query.set("searchTerm", params.searchTerm);
  if (params.verificationStatus && params.verificationStatus !== "ALL") {
    query.set("verificationStatus", params.verificationStatus);
  }
  if (params.departmentId) query.set("departmentId", params.departmentId);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  return apiClient<ApiResponse<InstructorApplication[]>>(
    `/instructors${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export function reviewInstructorApplication(instructorId: string, payload: ReviewInstructorPayload) {
  return apiClient(`/instructors/${instructorId}/review`, {
    method: "PATCH",
    body: payload,
  });
}