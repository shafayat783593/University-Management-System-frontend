import apiClient from "@/lib/apiClient";
import type {
  Announcement,
  ApiResponse,
  Meta,
  SemesterCalendar,
} from "@/components/types";

// Backend `GET /announcements` wraps the paginated payload inside `data`:
// { success, statusCode, message, data: { data: Announcement[], meta: Meta } }

export async function getPublishedAnnouncements(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  // ofetch resolves with the response body directly (no axios-style `.data` wrapper).
  const res = await apiClient<ApiResponse<Announcement[]>>(
    `/announcements${qs ? `?${qs}` : ""}`,
  );
  return { items: res.data ?? [], meta: res. meta};
}

export async function getAnnouncementById(id: string) {
  const res = await apiClient<ApiResponse<Announcement>>(
    `/announcements/${id}`,
  );
  return res.data;
}

export async function getSemesterCalendar(id: string) {
  const res = await apiClient<ApiResponse<SemesterCalendar>>(
    `/semesters/${id}/calendar`,
  );
  return res.data;
}
