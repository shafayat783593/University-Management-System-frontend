import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, AdmissionListRow } from "@/api";
import apiClient from "@/lib/apiClient";

// Query hook for admission applications
// Returns data, isLoading, isError, refetch

export function useAdmissionApplications(tab: string) {
  return useQuery<ApiResponse<AdmissionListRow>, Error>({
    queryKey: ['admission-applications', tab],
    queryFn: () => 
      apiClient<ApiResponse<AdmissionListRow>>(
        `/admissions/applications?tab=${tab}`
      ).then(res => res.data),
  });
}

// Mutation hook for reviewing admission applications
// Returns a mutation object with mutate function
export function useReviewAdmissionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id: string,
      payload: {
        status: "APPROVED" | "REJECTED",
        rejectionReason?: string,
      },
    }): Promise<void> => {
      // The actual mutation logic would go here
      // For now, we just call the review function
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
    },
  });
}
