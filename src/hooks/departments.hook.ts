import { useQuery } from "@tanstack/react-query";
import { getAllDepartment } from "@/api";

type Department = {
  id: string;
  name: string;
  code: string;
};

type ApiWrappedResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
};

export function useGetAllDepartment() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getAllDepartment,
    select: (res) => {
      // apiClient("/departments") returns { success, data: Department[], meta }
      // Unwrap to return Department[] for the component.
      // Handle both wrapped and unwrapped shapes defensively.
      const unwrapped = (res as ApiWrappedResponse<Department[]>)?.data ?? res;
      return Array.isArray(unwrapped) ? (unwrapped as Department[]) : [];
    },
  });
}
