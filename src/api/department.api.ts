import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";
import { getCourses } from "./admin.api";
import { getAllInstructorApplications } from "./instructor.api";
import { getAllSections } from "./sections.api";
import { getAllSemesters } from "./semesters.api";

export interface DeptCourse {
  id: string;
  code: string;
  title: string;
  creditHours: number;
}

export interface DeptInstructor {
  id: string;
  name: string;
  qualification?: string | null;
}

export interface DeptSection {
  id: string;
  course: { code: string; title: string };
  instructorName: string;
  capacity: number;
  enrolledCount: number;
  schedule?: string | null;
}

export interface DepartmentFullDetails {
  department: { id: string; name: string; code: string };
  courses: DeptCourse[];
  instructors: DeptInstructor[];
  currentSemester: {
    id: string;
    name: string;
    enrollmentStart?: string | null;
    enrollmentEnd?: string | null;
  } | null;
  sections: DeptSection[];
}

export function getAllDepartment() {
  return apiClient("/departments");
}

// GET /departments/:id — basic department only (backend has no /full route).
export async function getDepartmentById(id: string) {
  const res = await apiClient<ApiResponse<DepartmentFullDetails["department"]>>(
    `/departments/${id}`,
  );
  return res.data;
}

// department + courses?departmentId + approved instructors + open semester sections.
export async function getDepartmentDetails(
  id: string,
): Promise<DepartmentFullDetails> {
  const [department, courses, instructorRes, semesterRes] = await Promise.all([
    getDepartmentById(id),
    getCourses(id).catch(() => []),
    getAllInstructorApplications({
      verificationStatus: "APPROVED",
      limit: 50,
    }).catch(() => ({ data: [] as never[] })),
    getAllSemesters({ status: "OPEN", limit: 1 }).catch(() => ({
      items: [] as never[],
    })),
  ]);

  // Backend departmentId filter is unreliable, so filter here.
  const raw = instructorRes as unknown;
  const allInstructors = (
    Array.isArray(raw) ? raw : ((raw as { data?: unknown })?.data ?? [])
  ) as Array<{
    id: string;
    department?: { id: string };
    user?: { name: string };
    qualification?: string | null;
  }>;
  const instructors: DeptInstructor[] = allInstructors
    .filter((i) => i.department?.id === id)
    .map(
      (i): DeptInstructor => ({
        id: i.id,
        name: i.user?.name ?? "Faculty Member",
        qualification: i.qualification ?? null,
      }),
    );

  const openSemester =
    (
      semesterRes as {
        items?: Array<{
          id: string;
          name: string;
          enrollmentStart?: string | null;
          enrollmentEnd?: string | null;
        }>;
      }
    )?.items?.[0] ?? null;
  const currentSemester = openSemester
    ? {
        id: openSemester.id,
        name: openSemester.name,
        enrollmentStart: openSemester.enrollmentStart ?? null,
        enrollmentEnd: openSemester.enrollmentEnd ?? null,
      }
    : null;

  // Sections of the open semester that belong to this department's courses.
  let sections: DeptSection[] = [];
  if (currentSemester) {
    const sectionRes = await getAllSections({
      semesterId: currentSemester.id,
      limit: 50,
    }).catch(() => ({ items: [] }));
    sections = (
      (
        sectionRes as {
          items?: Array<{
            id: string;
            capacity: number;
            enrolledCount: number;
            schedule?: string | null;
            course?: { code: string; title: string; departmentId?: string };
            instructor?: { user?: { name: string } };
          }>;
        }
      )?.items ?? []
    )
      .filter((s) => s.course?.departmentId === id)
      .map((s) => ({
        id: s.id,
        course: { code: s.course?.code ?? "", title: s.course?.title ?? "" },
        instructorName: s.instructor?.user?.name ?? "TBA",
        capacity: s.capacity,
        enrolledCount: s.enrolledCount,
        schedule: s.schedule ?? null,
      }));
  }

  return { department, courses, instructors, currentSemester, sections };
}
