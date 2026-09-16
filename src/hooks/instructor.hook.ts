import { useMutation } from "@tanstack/react-query";
import { applyAsInstructor } from "@/api";

export function useApplyAsInstructor() {
  return useMutation({ mutationFn: applyAsInstructor });
}
