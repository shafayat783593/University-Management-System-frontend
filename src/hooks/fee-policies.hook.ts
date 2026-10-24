import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFeePolicy,
  createInstallmentPolicy,
  getFeePolicies,
  getInstallmentPolicies,
  updateFeePolicy,
  updateInstallmentPolicy,
  type FeePolicyFilters,
  type InstallmentPolicyPayload,
  type UpdateFeePolicyPayload,
} from "@/api";

const FEE_POLICIES_KEY = ["fee-policies"] as const;
const INSTALLMENT_POLICIES_KEY = ["installment-policies"] as const;

export function useFeePolicyList(filters?: FeePolicyFilters) {
  return useQuery({
    queryKey: [...FEE_POLICIES_KEY, "list", filters ?? {}],
    queryFn: () => getFeePolicies(filters),
    staleTime: 60 * 1000,
  });
}

export function useCreateFeePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeePolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FEE_POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: INSTALLMENT_POLICIES_KEY });
    },
  });
}

export function useUpdateFeePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeePolicyPayload }) =>
      updateFeePolicy(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FEE_POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: INSTALLMENT_POLICIES_KEY });
    },
  });
}

export function useInstallmentPolicyList() {
  return useQuery({
    queryKey: [...INSTALLMENT_POLICIES_KEY, "list"],
    queryFn: getInstallmentPolicies,
    staleTime: 60 * 1000,
  });
}

export function useCreateInstallmentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstallmentPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSTALLMENT_POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: FEE_POLICIES_KEY });
    },
  });
}

export function useUpdateInstallmentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InstallmentPolicyPayload }) =>
      updateInstallmentPolicy(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSTALLMENT_POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: FEE_POLICIES_KEY });
    },
  });
}
