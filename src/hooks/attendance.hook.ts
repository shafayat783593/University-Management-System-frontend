import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttendanceSession,
  getMyAttendance,
  getSectionAttendance,
  getSectionEnrollments,
  markAttendance,
} from "@/api";
import type { AttendanceStatus } from "@/components/types";

export function useMyAttendance() {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: getMyAttendance,
    staleTime: 30 * 1000,
  });
}

/* Instructor (Task 18) ------------------------------------------ */

export function useSectionEnrollments(sectionId: string) {
  return useQuery({
    queryKey: ["section-enrollments", sectionId],
    queryFn: () => getSectionEnrollments(sectionId),
    staleTime: 30 * 1000,
  });
}

export function useSectionAttendance(sectionId: string) {
  return useQuery({
    queryKey: ["section-attendance", sectionId],
    queryFn: () => getSectionAttendance(sectionId),
    staleTime: 30 * 1000,
  });
}

export function useCreateAttendanceSession(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => createAttendanceSession({ sectionId, date }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["section-attendance", sectionId],
      });
    },
  });
}

export function useMarkAttendance(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      records,
    }: {
      sessionId: string;
      records: { studentId: string; status: AttendanceStatus }[];
    }) => markAttendance(sessionId, records),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["section-attendance", sectionId],
      });
    },
  });
}
