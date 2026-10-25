import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  getPublishedAnnouncements,
  updateAnnouncement,
  type AnnouncementPayload,
} from "@/api";

export function usePublishedAnnouncements(
  page: number,
  limit = 10,
  category?: string,
  initialItems?: import("@/components/types").Announcement[],
) {
  return useQuery({
    queryKey: ["announcements", "published", page, limit, category],
    queryFn: () => getPublishedAnnouncements({ page, limit, category }),
    initialData:
      initialItems !== undefined
        ? { items: initialItems, meta: undefined as never }
        : undefined,
    staleTime: 60_000,
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

export function useAdminAnnouncements(page = 1, category?: string) {
  return useQuery({
    queryKey: ["announcements", "admin", page, category],
    queryFn: () => getAdminAnnouncements(page, 10, category),
    placeholderData: (prev) => prev,
  });
}

type CreateInput = AnnouncementPayload & { image?: File };
type UpdateInput = { id: string } & Partial<AnnouncementPayload> & { image?: File };

export function useCreateAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({
    mutationFn: (input: CreateInput) =>
      createAnnouncement(
        {
          title: input.title,
          body: input.body,
          isPublished: input.isPublished,
          category: input.category,
        },
        input.image,
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({
    mutationFn: (input: UpdateInput) =>
      updateAnnouncement(
        input.id,
        {
          title: input.title,
          body: input.body,
          isPublished: input.isPublished,
          category: input.category,
        },
        input.image,
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({ mutationFn: deleteAnnouncement, onSuccess: invalidate });
}