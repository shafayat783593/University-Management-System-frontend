import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdmissionApplications,
  getMyAdmissionApplication,
  reviewAdmissionApplication,
  submitAdmissionApplication,
  updateAdmissionApplication,
} from "@/api";

/* Admin review queue -------------------------------------------- */

export function useAdmissionApplications(status?: string) {
  return useQuery({
    queryKey: ["admission-applications", status ?? "ALL"],
    queryFn: () => getAdmissionApplications(status),
    staleTime: 30 * 1000,
  });
}

export function useReviewAdmissionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: "APPROVED" | "REJECTED"; rejectionReason?: string };
    }) => reviewAdmissionApplication(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admission-applications"] });
    },
  });
}
/* My application (student) ---------------------------------------- */

// `null` data = "not submitted yet" (not an error).
export function useMyAdmissionApplication(enabled = true) {
  return useQuery({
    queryKey: ["admission-application", "me"],
    queryFn: getMyAdmissionApplication,
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useSubmitAdmissionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAdmissionApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admission-application", "me"],
      });
    },
  });
}

export function useUpdateAdmissionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdmissionApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admission-application", "me"],
      });
    },
  });
}
