import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEnrollment,
  dropEnrollment,
  getAllSections,
  getAllSemesters,
  getMyEnrollments,
  withdrawEnrollment,
} from "@/api";



export function useSemesters( page = 1, status?: string,) {
  return useQuery({
    queryKey: ["semesters", page, status ?? "all"],
    queryFn: () =>
      getAllSemesters({
        page,
        status,
        limit: 50,
      }),
    staleTime: 2 * 60 * 1000,
  });
}





export function useSections(params: {
  semesterId?: string;
  searchTerm?: string;
  page?: number;
  enabled?: boolean;
}) {
  const {semesterId,searchTerm,page = 1,enabled = true,} = params;

  return useQuery({
    queryKey: ["sections",semesterId ?? "none",searchTerm ?? "",  page,],

    queryFn: () =>
      getAllSections({
        semesterId,
        searchTerm,
        page,
        limit: 50,
      }),

    enabled: enabled && Boolean(semesterId),

    placeholderData: (prev) => prev,

    staleTime: 30 * 1000,
  });
}





export function useInstructorSections(instructorId?: string) {
  return useQuery({
    queryKey: ["sections", "mine", instructorId ?? "none"],
    queryFn: () => getAllSections({ instructorId, limit: 50 }),
    enabled: Boolean(instructorId),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sections"] });
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });
}

export function useMyEnrollments() {
  return useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
    staleTime: 30 * 1000,
  });
}

export function useDropEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dropEnrollment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useWithdrawEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawEnrollment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });
}
