import { useQuery } from "@tanstack/react-query";
import { getAllDepartment, getDepartmentDetails } from "@/api";

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: { courses?: number; students?: number; instructors?: number };
};

type ApiWrappedResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
};

export function useGetAllDepartment(initialData?: Department[]) {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getAllDepartment,
    initialData: initialData as unknown as Awaited<ReturnType<typeof getAllDepartment>> | undefined,
    staleTime: 60_000,
    select: (res) => {
      const unwrapped = (res as ApiWrappedResponse<Department[]>)?.data ?? res;
      return Array.isArray(unwrapped) ? (unwrapped as Department[]) : [];
    },
  });
}

export function useDepartmentDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["departments", id, "details"],
    queryFn: () => getDepartmentDetails(id as string),
    enabled: Boolean(id),
    retry: 1,
  });
}
