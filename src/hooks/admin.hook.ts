import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourse,
  createDepartment,
  createSection,
  createSemester,
  deleteCourse,
  deleteDepartment,
  deleteSection,
  generateFees,
  getAllInstructorApplications,
  getAllPayments,
  getAuditLogs,
  getAllSections,
  getCourses,
  getDashboardSummary,
  getDepartments,
  getSectionExams,
  overrideResult,
  publishExamResults,
  updateCourse,
  updateDepartment,
  updateSection,
  updateSemesterDates,
  updateSemesterStatus,
  type GenerateFeesPayload,
  type SemesterDatesPayload,
} from "@/api";
import type { AuditLogParams, OverrideResultPayload } from "@/components/types";
import type { PaymentsParams } from "@/components/types";

/* Departments ----------------------------------------------- */

export function useDepartments(page = 1) {
  return useQuery({
    queryKey: ["departments", page],
    queryFn: () => getDepartments(page),
    placeholderData: (prev) => prev,
  });
}

function useInvalidate(key: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [key] });
  };
}

export function useCreateDepartment() {
  const invalidate = useInvalidate("departments");
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: invalidate,
  });
}

export function useUpdateDepartment() {
  const invalidate = useInvalidate("departments");
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      name: string;
      code: string;
    }) => updateDepartment(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteDepartment() {
  const invalidate = useInvalidate("departments");
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: invalidate,
  });
}

/* Courses ---------------------------------------------------- */

export function useCourses(departmentId?: string) {
  return useQuery({
    queryKey: ["courses", departmentId ?? "all"],
    queryFn: () => getCourses(departmentId),
  });
}

export function useCreateCourse() {
  const invalidate = useInvalidate("courses");
  return useMutation({ mutationFn: createCourse, onSuccess: invalidate });
}

export function useUpdateCourse() {
  const invalidate = useInvalidate("courses");
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      title: string;
      creditHours: number;
      prerequisiteCourseIds: string[];
    }) => updateCourse(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCourse() {
  const invalidate = useInvalidate("courses");
  return useMutation({ mutationFn: deleteCourse, onSuccess: invalidate });
}

/* Semesters --------------------------------------------------- */

export function useCreateSemester() {
  const invalidate = useInvalidate("semesters");
  return useMutation({ mutationFn: createSemester, onSuccess: invalidate });
}

export function useUpdateSemesterStatus() {
  const invalidate = useInvalidate("semesters");
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateSemesterStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useUpdateSemesterDates() {
  const invalidate = useInvalidate("semesters");
  return useMutation({
    mutationFn: ({ id, ...dates }: { id: string } & SemesterDatesPayload) =>
      updateSemesterDates(id, dates),
    onSuccess: invalidate,
  });
}

/* Fees -------------------------------------------------------- */

export function useGenerateFees() {
  const invalidate = useInvalidate("payments");
  return useMutation({
    mutationFn: (payload: GenerateFeesPayload) => generateFees(payload),
    onSuccess: invalidate,
  });
}

/* Dashboard ---------------------------------------------------- */

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
  });
}

/* Audit logs --------------------------------------------------- */

export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
    placeholderData: (prev) => prev,
  });
}

/* Payments ----------------------------------------------------- */

export function useAdminPayments(params: PaymentsParams) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getAllPayments(params),
    placeholderData: (prev) => prev,
  });
}

/* Results ------------------------------------------------------ */

export function useSectionExams(sectionId?: string) {
  return useQuery({
    queryKey: ["exams", sectionId ?? "none"],
    queryFn: () => getSectionExams(sectionId as string),
    enabled: Boolean(sectionId),
  });
}

export function usePublishExamResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishExamResults,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useOverrideResult() {
  return useMutation({
    mutationFn: ({
      resultId,
      ...payload
    }: { resultId: string } & OverrideResultPayload) =>
      overrideResult(resultId, payload),
  });
}

/* Sections ----------------------------------------------------- */

export function useAdminSections(page = 1) {
  return useQuery({
    queryKey: ["sections", "admin", page],
    queryFn: () => getAllSections({ page, limit: 10 }),
    placeholderData: (prev) => prev,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      instructorId?: string;
      capacity?: number;
      schedule?: string;
    }) => updateSection(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

/* Approved instructors (for the section form) ------------------ */

export function useApprovedInstructors() {
  return useQuery({
    queryKey: ["approved-instructors"],
    queryFn: async () => {
      const res = await getAllInstructorApplications({
        verificationStatus: "APPROVED",
        limit: 100,
      });
      return res.data ?? [];
    },
  });
}
