import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchError } from "ofetch";
import { toast } from "sonner";
import {
  changePassword,
  completeProfile,
  downloadIdCardPdf,
  getIdCardStatus,
  getMe,
  googleOAuth,
  updateProfileImage,
  updateStudentProfile,
  userLogin,
  userLogout,
  userRegistration,
  verifyAccount,
} from "@/api";
import { clearAccessToken, saveAuthFromResponse } from "@/lib/apiClient";

export const ME_QUERY_KEY = ["me"] as const;

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FetchError) {
    const message = (error.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function isUnauthorized(error: unknown) {
  return error instanceof FetchError && error.status === 401;
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogin,
    onSuccess: (res) => {
      saveAuthFromResponse(res);
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useVerifyAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyAccount,
    onSuccess: (res) => {
      saveAuthFromResponse(res);
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useGoogleOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: googleOAuth,
    onSuccess: (res) => {
      saveAuthFromResponse(res);
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    retry: (failureCount, error) => {
      if (isUnauthorized(error)) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export const useAuth = useGetMe;

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useCompleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
    onError: (err) => {
      if (err instanceof FetchError && err.status === 409) {
        toast.error("Profile already completed");
        return;
      }
      toast.error(getApiErrorMessage(err, "Could not complete profile."));
    },
  });
}

export function useDownloadIdCard() {
  return useMutation({
    mutationFn: (studentIdCode: string) => downloadIdCardPdf(studentIdCode),
  });
}

export const ID_CARD_STATUS_KEY = ["id-card", "status"] as const;

/**
 * Whether the ID card can be downloaded (admission confirmed + the ID card
 * fee settled) and which profile fields are still missing.
 */
export function useIdCardStatus() {
  return useQuery({
    queryKey: ID_CARD_STATUS_KEY,
    queryFn: getIdCardStatus,
    retry: (failureCount, error) => {
      if (isUnauthorized(error)) return false;
      return failureCount < 1;
    },
    staleTime: 30 * 1000,
  });
}
