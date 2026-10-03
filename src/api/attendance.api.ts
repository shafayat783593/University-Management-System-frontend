import type { ApiResponse, AttendanceRecord } from "@/components/types";
import apiClient from "@/lib/apiClient";

export async function getMyAttendance() {
  const res = await apiClient<ApiResponse<AttendanceRecord[]>>("/attendance/my");
  return res.data ?? [];
}
