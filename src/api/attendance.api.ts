import type {
  ApiResponse,
  AttendanceRecord,
  AttendanceStatus,
  SectionAttendanceSession,
} from "@/components/types";
import apiClient from "@/lib/apiClient";

export async function getMyAttendance() {
  const res = await apiClient<ApiResponse<AttendanceRecord[]>>("/attendance/my");
  return res.data ?? [];
}

/* Instructor --------------------------------------------------- */

export async function createAttendanceSession(payload: {
  sectionId: string;
  date: string;
}) {
  const res = await apiClient<ApiResponse<SectionAttendanceSession>>(
    "/attendance/sessions",
    { method: "POST", body: payload },
  );
  return res.data;
}

export async function markAttendance(
  sessionId: string,
  records: { studentId: string; status: AttendanceStatus }[],
) {
  const res = await apiClient(`/attendance/sessions/${sessionId}/mark`, {
    method: "POST",
    body: { records },
  });
  return res.data;
}

export async function getSectionAttendance(sectionId: string) {
  const res = await apiClient<ApiResponse<SectionAttendanceSession[]>>(
    `/attendance/sections/${sectionId}`,
  );
  return res.data ?? [];
}
