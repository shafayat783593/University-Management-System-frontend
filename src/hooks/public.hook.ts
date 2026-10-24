import { useQuery } from "@tanstack/react-query";
import { getPublicDepartments, getPublicFaculty, getPublicStats } from "@/api";

// Task 6B — easy public hooks for the landing page (no auth needed).

export function usePublicStats(initial?: { students?: number; instructors?: number; departments?: number; courses?: number }) {
  return useQuery({
    queryKey: ["public", "stats"],
    queryFn: getPublicStats,
    initialData: initial as never,
    staleTime: 60_000,
  });
}

export function usePublicDepartmentCards(initial?: never) {
  return useQuery({
    queryKey: ["public", "departments"],
    queryFn: getPublicDepartments,
    initialData: initial,
    staleTime: 60_000,
  });
}

export function usePublicFacultyList(limit = 4) {
  return useQuery({
    queryKey: ["public", "faculty", limit],
    queryFn: () => getPublicFaculty(limit),
    staleTime: 60_000,
  });
}
