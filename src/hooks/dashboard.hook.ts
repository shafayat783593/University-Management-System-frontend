import { useQuery } from "@tanstack/react-query";
import { getInstructorDashboard, getStudentDashboard } from "@/api";

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: getStudentDashboard,
    staleTime: 30 * 1000,
  });
}

export function useInstructorDashboard() {
  return useQuery({
    queryKey: ["instructor-dashboard"],
    queryFn: getInstructorDashboard,
    staleTime: 30 * 1000,
  });
}
