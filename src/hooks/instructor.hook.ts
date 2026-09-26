import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyAsInstructor,
  getAllInstructorApplications,
  reviewInstructorApplication,
  verifyInstructorEmailVerify,
} from "@/api";
import type {
  GetInstructorApplicationsParams,
  ReviewInstructorPayload,
} from "@/components/types";

export function useApplyAsInstructor() {
  return useMutation({ mutationFn: applyAsInstructor });
}

export function useVerifyInstructorEmailVerify () {
  return useMutation({ mutationFn: verifyInstructorEmailVerify});
}

export function useGetInstructorApplications(params: GetInstructorApplicationsParams) {
  return useQuery({
    queryKey: ["instructor-applications", params],
    queryFn: () => getAllInstructorApplications(params),
    placeholderData: (prev) => prev,
  });
}

export function useReviewInstructorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      instructorId,
      payload,
    }: {
      instructorId: string;
      payload: ReviewInstructorPayload;
    }) => reviewInstructorApplication(instructorId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["instructor-applications"] });
    },
  });
}
