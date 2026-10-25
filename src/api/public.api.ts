import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

// Each helper falls back to [] / null so the landing page never crashes
// when the backend is down or billing isn't configured yet.

export interface FeeScheduleLine {
  itemType: string;
  label: string;
  calcMethod: "FLAT" | "PER_CREDIT";
  amount: number; // per credit for PER_CREDIT, else flat amount (BDT)
  isRefundable: boolean;
}

export interface PublicDepartment {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: { courses?: number; instructors?: number; students?: number };
  feeSchedule: FeeScheduleLine[];
}

export interface PublicStats {
  students: number;
  instructors: number;
  departments: number;
  courses: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const res = await apiClient<ApiResponse<PublicStats>>("/public/stats");
    return res.data ?? { students: 0, instructors: 0, departments: 0, courses: 0 };
  } catch {
    return { students: 0, instructors: 0, departments: 0, courses: 0 };
  }
}

export async function getPublicDepartments(): Promise<{
  departments: PublicDepartment[];
  semester: { id: string; name: string } | null;
}> {
  try {
    const res = await apiClient<
      ApiResponse<{ departments: PublicDepartment[]; semester: { id: string; name: string } | null }>
    >("/public/departments");
    return res.data ?? { departments: [], semester: null };
  } catch {
    return { departments: [], semester: null };
  }
}

export async function getPublicFaculty(limit = 4) {
  try {
    const res = await apiClient<ApiResponse<unknown>>(`/public/faculty?limit=${limit}`);
    const data = res.data as unknown;
    return (Array.isArray(data) ? data : []) as Array<{
      id: string;
      qualification: string | null;
      department?: { name?: string } | null;
      user?: { name?: string; imageUrl?: string | null } | null;
    }>;
  } catch {
    return [];
  }
}

export async function getPublicCalendar() {
  try {
    const res = await apiClient<ApiResponse<unknown>>("/public/calendar");
    return (res.data ?? null) as {
      semesterId?: string;
      semesterName?: string;
      events?: Array<{ type: string; label: string; start?: string | null; end?: string | null }>;
    } | null;
  } catch {
    return null;
  }
}
