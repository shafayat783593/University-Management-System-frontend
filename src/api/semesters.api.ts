import type { ApiResponse, Semester } from "@/components/types";
import { semesterParams } from "@/components/types/semesters.types";
import apiClient from "@/lib/apiClient";




export async function getAllSemesters(params?: semesterParams) {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
  if (params?.year) query.set("year", String(params.year));
  if (params?.term) query.set("term", params.term);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  const res = await apiClient<ApiResponse<Semester[]>>(`/semesters?${query.toString()}`,);

  return {items: res.data ?? [], meta: res.meta,
  };
}