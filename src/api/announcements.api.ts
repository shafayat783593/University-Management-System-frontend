import apiClient from "@/lib/apiClient";
import type {
  Announcement,
  ApiResponse,
  Meta,
  SemesterCalendar,
} from "@/components/types";

// Backend list endpoints wrap the payload inside `data`:
// { success, statusCode, message, data: { data: Announcement[], meta: Meta } }
function normalizeList(res: ApiResponse<unknown>) {
  const body = res.data as
    | Announcement[]
    | { data?: Announcement[]; meta?: Meta }
    | null;
  if (Array.isArray(body)) return { items: body, meta: res.meta };
  return { items: body?.data ?? [], meta: body?.meta ?? res.meta };
}

export async function getPublishedAnnouncements(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  // ofetch resolves with the response body directly (no axios-style `.data` wrapper).
  const res = await apiClient<ApiResponse<unknown>>(
    `/announcements${qs ? `?${qs}` : ""}`,
  );
  return normalizeList(res);
}

/* Admin (includes drafts) -------------------------------------- */

export interface AnnouncementPayload {
  title: string;
  body: string;
  isPublished: boolean;
}

export async function getAdminAnnouncements(page = 1, limit = 10) {
  const res = await apiClient<ApiResponse<unknown>>(
    `/announcements/admin?page=${page}&limit=${limit}`,
  );
  return normalizeList(res);
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const res = await apiClient<ApiResponse<Announcement>>("/announcements", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<AnnouncementPayload>,
) {
  const res = await apiClient<ApiResponse<Announcement>>(
    `/announcements/${id}`,
    { method: "PATCH", body: payload },
  );
  return res.data;
}

export async function deleteAnnouncement(id: string) {
  await apiClient(`/announcements/${id}`, { method: "DELETE" });
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
