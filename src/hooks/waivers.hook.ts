import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWaiver,
  getWaivers,
  updateWaiver,
  type CreateWaiverPayload,
} from "@/api";

const WAIVERS_KEY = ["waivers"] as const;

export function useWaivers() {
  return useQuery({
    queryKey: WAIVERS_KEY,
    queryFn: getWaivers,
    staleTime: 30 * 1000,
  });
}

export function useCreateWaiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWaiver,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WAIVERS_KEY });
    },
  });
}

export function useUpdateWaiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive?: boolean; validTo?: string | null };
    }) => updateWaiver(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WAIVERS_KEY });
    },
  });
}

export type { CreateWaiverPayload };
