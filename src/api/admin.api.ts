import type {
  ApiResponse,
  Course,
  DashboardSummary,
  Department,
  Exam,
  OverrideResultPayload,
  Payment,
  PaymentsParams,
} from "@/components/types";
import apiClient from "@/lib/apiClient";

/* Departments ----------------------------------------------- */

export async function getDepartments(page = 1) {
  const res = await apiClient<ApiResponse<Department[]>>(
    `/departments?page=${page}&limit=10`,
  );
  return { items: res.data ?? [], meta: res.meta };
}

export async function createDepartment(payload: {
  name: string;
  code: string;
}) {
  const res = await apiClient<ApiResponse<Department>>("/departments", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateDepartment(
  id: string,
  payload: { name: string; code: string },
) {
  const res = await apiClient<ApiResponse<Department>>(`/departments/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteDepartment(id: string) {
  await apiClient(`/departments/${id}`, { method: "DELETE" });
}

/* Courses ---------------------------------------------------- */

export async function getCourses(departmentId?: string) {
  const qs = departmentId ? `?departmentId=${departmentId}` : "";
  const res = await apiClient<ApiResponse<Course[]>>(`/courses${qs}`);
  return res.data ?? [];
}

export async function createCourse(payload: {
  code: string;
  title: string;
  creditHours: number;
  departmentId: string;
  prerequisiteCourseIds?: string[];
}) {
  const res = await apiClient<ApiResponse<Course>>("/courses", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateCourse(
  id: string,
  payload: {
    title: string;
    creditHours: number;
    prerequisiteCourseIds: string[];
  },
) {
  const res = await apiClient<ApiResponse<Course>>(`/courses/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteCourse(id: string) {
  await apiClient(`/courses/${id}`, { method: "DELETE" });
}

/* Semesters (list lives in semesters.api) --------------------- */

export async function createSemester(payload: {
  name: string;
  year: number;
  term: string;
}) {
  const res = await apiClient("/semesters", { method: "POST", body: payload });
  return res.data;
}

export async function updateSemesterStatus(id: string, status: string) {
  const res = await apiClient(`/semesters/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return res.data;
}

export interface SemesterDatesPayload {
  enrollmentStart?: string;
  enrollmentEnd?: string;
  examWeekStart?: string;
  examWeekEnd?: string;
  resultPublishDate?: string;
}

export async function updateSemesterDates(id: string, payload: SemesterDatesPayload) {
  const res = await apiClient(`/semesters/${id}/dates`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

/* Fees ------------------------------------------------------- */

export interface GenerateFeesPayload {
  semesterId: string;
  amount: number;
  dueDate?: string;
}

export interface GenerateFeesResult {
  generatedCount: number;
  totalActiveStudents: number;
}

export async function generateFees(payload: GenerateFeesPayload) {
  const res = await apiClient<ApiResponse<GenerateFeesResult>>(
    "/fees/generate",
    { method: "POST", body: payload },
  );
  return res.data;
}

/* Payments --------------------------------------------------- */

export async function getAllPayments(params: PaymentsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status && params.status !== "ALL")
    query.set("status", params.status);
  if (params.studentId) query.set("studentId", params.studentId);
  if (params.semesterId) query.set("semesterId", params.semesterId);
  if (params.searchTerm) query.set("searchTerm", params.searchTerm);

  const qs = query.toString();
  const res = await apiClient<ApiResponse<Payment[]>>(
    `/payments${qs ? `?${qs}` : ""}`,
  );
  return { items: res.data ?? [], meta: res.meta };
}

/* Results ---------------------------------------------------- */

export async function getSectionExams(sectionId: string) {
  const res = await apiClient<ApiResponse<Exam[]>>(
    `/exams/sections/${sectionId}`,
  );
  return res.data ?? [];
}

export async function publishExamResults(examId: string) {
  const res = await apiClient(`/results/exams/${examId}/publish`, {
    method: "PATCH",
  });
  return res.data;
}

export async function overrideResult(
  resultId: string,
  payload: OverrideResultPayload,
) {
  const res = await apiClient(`/results/${resultId}/override`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

/* Dashboard -------------------------------------------------- */

export async function getDashboardSummary() {
  const res = await apiClient<ApiResponse<DashboardSummary>>(
    "/dashboard/summary",
  );
  return res.data;
}

/* Sections (list lives in sections.api) ----------------------- */

export async function createSection(payload: {
  courseId: string;
  semesterId: string;
  instructorId: string;
  capacity: number;
  schedule?: string;
}) {
  const res = await apiClient("/sections", { method: "POST", body: payload });
  return res.data;
}

export async function updateSection(
  id: string,
  payload: { instructorId?: string; capacity?: number; schedule?: string },
) {
  const res = await apiClient(`/sections/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteSection(id: string) {
  await apiClient(`/sections/${id}`, { method: "DELETE" });
}
