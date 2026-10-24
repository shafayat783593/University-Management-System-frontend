import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRoutineEntry,
  deleteRoutineEntry,
  getMyInstructorRoutine,
  getMyRoutine,
} from "@/api";

// Student's weekly timetable across all enrolled sections.
export function useMyRoutine() {
  return useQuery({
    queryKey: ["routines", "my"],
    queryFn: getMyRoutine,
    staleTime: 60 * 1000,
  });
}

// Instructor's own teaching schedule.
export function useMyInstructorRoutine() {
  return useQuery({
    queryKey: ["routines", "instructor", "my"],
    queryFn: getMyInstructorRoutine,
    staleTime: 60 * 1000,
  });
}

export function useCreateRoutineEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoutineEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["routines", "instructor", "my"],
      });
    },
  });
}

export function useDeleteRoutineEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoutineEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["routines", "instructor", "my"],
      });
    },
  });
}
