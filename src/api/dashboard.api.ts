import type { ApiResponse, InstructorDashboard, StudentDashboard } from "@/components/types";
import apiClient from "@/lib/apiClient";

export async function getStudentDashboard() {
  const res = await apiClient<ApiResponse<StudentDashboard>>("/dashboard/student");
  return res.data;
}

export async function getInstructorDashboard() {
  const res = await apiClient<ApiResponse<InstructorDashboard>>("/dashboard/instructor");
  return res.data;
}
