import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  getPublishedAnnouncements,
  updateAnnouncement,
  type AnnouncementPayload,
} from "@/api";

export function usePublishedAnnouncements(page: number, limit = 10) {
  return useQuery({
    queryKey: ["announcements", "published", page, limit],
    queryFn: () => getPublishedAnnouncements({ page, limit }),
    placeholderData: (prev) => prev,
  });
}

/* Admin -------------------------------------------------------- */

function useInvalidateAnnouncements() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["announcements"] });
  };
}

export function useAdminAnnouncements(page = 1) {
  return useQuery({
    queryKey: ["announcements", "admin", page],
    queryFn: () => getAdminAnnouncements(page),
    placeholderData: (prev) => prev,
  });
}

export function useCreateAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({ mutationFn: createAnnouncement, onSuccess: invalidate });
}

export function useUpdateAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<AnnouncementPayload>) =>
      updateAnnouncement(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({ mutationFn: deleteAnnouncement, onSuccess: invalidate });
}
