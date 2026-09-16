import apiClient from "@/lib/apiClient";


export function getAllDepartment() {
  return apiClient("/departments");
}
