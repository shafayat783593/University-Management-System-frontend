import type { ApiResponse, Section } from "@/components/types";
import apiClient from "@/lib/apiClient";

interface GetAllSectionsParams {
  semesterId?: string;
  searchTerm?: string;
  title?: string;
  page?: number;
  limit?: number;
}

export async function getAllSections(
  params?: GetAllSectionsParams,
) {
  const query = new URLSearchParams();

  if (params?.semesterId) {
    query.set("semesterId", params.semesterId);
  }

  if (params?.searchTerm) {
    query.set("searchTerm", params.searchTerm);
  }

  if (params?.title) {
    query.set("title", params.title);
  }

  if (params?.page) {
    query.set("page", String(params.page));
  }

  query.set("limit", String(params?.limit ?? 50));

  const qs = query.toString();

  const res = await apiClient<ApiResponse<Section[]>>(
    `/sections${qs ? `?${qs}` : ""}`,
  );

  return {
    items: res.data ?? [],
    meta: res.meta
  };
}







