import { useQuery } from "@tanstack/react-query";
import { getMyAttendance } from "@/api";

export function useMyAttendance() {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: getMyAttendance,
    staleTime: 30 * 1000,
  });
}
