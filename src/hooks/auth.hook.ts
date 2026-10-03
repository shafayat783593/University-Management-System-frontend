import {
  changePassword,
  getMe,
  googleOAuth,
  updateProfileImage,
  updateStudentProfile,
  userLogin,
  userLogout,
  userRegistration,
  verifyAccount,

} from "@/api";
import type { ApiResponse, ChangePasswordPayload, MeUser } from "@/components/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchError } from "ofetch";

export const ME_QUERY_KEY = ["me"] as const;

/** Extract the backend's `{ message }` from a caught `FetchError`. */
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
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: userLogout,
  });
}

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: googleOAuth,
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
      // Refresh `me` so needPasswordChange flips to false
      // and the AuthGuard stops forcing /profile.
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
