import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

export interface MyRoutineEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  section: {
    id: string;
    schedule?: string | null;
    course: { code: string; title: string };
    instructor?: { user: { name: string } } | null;
  };
}

export async function getMyRoutine() {
  const res = await apiClient<ApiResponse<MyRoutineEntry[]>>("/routines/my");
  return res.data ?? [];
}

/* Instructor routine ------------------------------------------- */

// One row of the instructor's own teaching timetable.
export interface InstructorRoutineEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  section: {
    id: string;
    course: { code: string; title: string };
  };
}

export interface CreateRoutineEntryPayload {
  sectionId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
}

// GET /routines/instructor/my — own teaching schedule as a timetable.
export async function getMyInstructorRoutine() {
  const res = await apiClient<ApiResponse<InstructorRoutineEntry[]>>(
    "/routines/instructor/my",
  );
  return res.data ?? [];
}

// POST /routines — 409 means a real scheduling conflict (overlapping class).
export async function createRoutineEntry(payload: CreateRoutineEntryPayload) {
  const res = await apiClient<ApiResponse<InstructorRoutineEntry>>(
    "/routines",
    { method: "POST", body: payload },
  );
  return res.data;
}

// DELETE /routines/:id — only own sections (backend checks).
export async function deleteRoutineEntry(id: string) {
  const res = await apiClient(`/routines/${id}`, { method: "DELETE" });
  return res.data;
}
