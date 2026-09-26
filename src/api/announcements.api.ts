import apiClient from "@/lib/apiClient";
import type {
  Announcement,
  PaginatedMeta,
  SemesterCalendar,
} from "@/components/types";

interface AnnouncementsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // NOTE: backend nests list payload as data: { data, meta }
  data: { data: Announcement[]; meta: PaginatedMeta };
}

interface AnnouncementDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Announcement;
}

export async function getPublishedAnnouncements(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const res = await apiClient<AnnouncementsListResponse>(
    `/announcements${qs ? `?${qs}` : ""}`,
  );
  return { items: res.data.data, meta: res.data.meta };
}

export async function getAnnouncementById(id: string) {
  const res = await apiClient<AnnouncementDetailResponse>(
    `/announcements/${id}`,
  );
  return res.data;
}

interface SemesterCalendarResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SemesterCalendar;
}

export async function getSemesterCalendar(id: string) {
  const res = await apiClient<SemesterCalendarResponse>(
    `/semesters/${id}/calendar`,
  );
  return res.data;
}
