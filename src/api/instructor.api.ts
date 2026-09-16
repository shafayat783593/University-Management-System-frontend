import apiClient from "@/lib/apiClient";

export type ApplyAsInstructorPayload = { name: string; email: string; departmentId: string; qualification: string; resume: File };

export function applyAsInstructor({ resume, ...data }: ApplyAsInstructorPayload) {
  const body = new FormData();
  body.append("name", data.name.trim());
  body.append("email", data.email.trim().toLowerCase());
  body.append("departmentId", data.departmentId);
  if (data.qualification.trim()) body.append("qualification", data.qualification.trim());
  body.append("resume", resume);
  return apiClient("/instructors/apply", { method: "POST", body });
}
