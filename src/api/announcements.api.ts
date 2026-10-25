import type {
  Announcement,
  ApiResponse,
  Meta,
  SemesterCalendar,
} from "@/components/types";
import apiClient from "@/lib/apiClient";

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
  category?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();
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
  category?: string;
}

export async function getAdminAnnouncements(
  page = 1,
  limit = 10,
  category?: string,
) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) query.set("category", category);
  const res = await apiClient<ApiResponse<unknown>>(
    `/announcements/admin?${query.toString()}`,
  );
  return normalizeList(res);
}

export async function createAnnouncement(
  payload: AnnouncementPayload,
  image?: File,
) {
  if (image) {
    const fd = new FormData();
    fd.append("title", payload.title);
    fd.append("body", payload.body);
    fd.append("isPublished", String(payload.isPublished));
    if (payload.category) fd.append("category", payload.category);
    fd.append("image", image);
    const res = await apiClient<ApiResponse<Announcement>>("/announcements", {
      method: "POST",
      body: fd,
    });
    return res.data;
  }
  const res = await apiClient<ApiResponse<Announcement>>("/announcements", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<AnnouncementPayload>,
  image?: File,
) {
  if (image) {
    const fd = new FormData();
    if (payload.title) fd.append("title", payload.title);
    if (payload.body) fd.append("body", payload.body);
    if (payload.isPublished !== undefined)
      fd.append("isPublished", String(payload.isPublished));
    if (payload.category) fd.append("category", payload.category);
    fd.append("image", image);
    const res = await apiClient<ApiResponse<Announcement>>(
      `/announcements/${id}`,
      { method: "PATCH", body: fd },
    );
    return res.data;
  }
  const res = await apiClient<ApiResponse<Announcement>>(`/announcements/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteAnnouncement(id: string) {
  await apiClient(`/announcements/${id}`, { method: "DELETE" });
}

export async function getAnnouncementById(id: string) {
  const res = await apiClient<ApiResponse<Announcement>>(`/announcements/${id}`);
  return res.data;
}

export async function getSemesterCalendar(id: string) {
  const res = await apiClient<ApiResponse<SemesterCalendar>>(
    `/semesters/${id}/calendar`,
  );
  return res.data;
}