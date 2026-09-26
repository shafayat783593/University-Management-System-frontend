import { useQuery } from "@tanstack/react-query";
import { getPublishedAnnouncements } from "@/api";

export function usePublishedAnnouncements(page: number, limit = 10) {
  return useQuery({
    queryKey: ["announcements", "published", page, limit],
    queryFn: () => getPublishedAnnouncements({ page, limit }),
    placeholderData: (prev) => prev,
  });
}
