import type { ApiResponse } from "@/components/types/api";
import apiClient from "@/lib/apiClient";

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
  const res = await apiClient<
    ApiResponse<
      DepartmentFullDetails["department"] & {
        courses?: Array<{
          id: string;
          code: string;
          title: string;
          creditHours: number;
        }>;
        instructors?: Array<{
          id: string;
          qualification?: string | null;
          verificationStatus?: string | null;
          user?: { name?: string | null } | null;
        }>;
      }
    >
  >(`/departments/${id}`);
  return res.data;
}

// department + courses?departmentId + approved instructors + open semester sections.
export async function getDepartmentDetails(
  id: string,
): Promise<DepartmentFullDetails> {
  // `getDepartmentById` now returns the department together with its courses
  // and instructors, so a single (public) request is enough to render the
  // whole department page instead of a cascade of authenticated ones.
  const department = await getDepartmentById(id);

  type RelCourse = {
    id: string;
    code: string;
    title: string;
    creditHours: number;
  };
  type RelInstructor = {
    id: string;
    user?: { name?: string | null } | null;
    qualification?: string | null;
    verificationStatus?: string | null;
  };
  const relDepartment = department as {
    courses?: RelCourse[];
    instructors?: RelInstructor[];
  };

  const courses: DeptCourse[] = (relDepartment.courses ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    creditHours: c.creditHours,
  }));

  const instructors: DeptInstructor[] = (relDepartment.instructors ?? [])
    .filter((i) => i.verificationStatus === "APPROVED" || !i.verificationStatus)
    .map(
      (i): DeptInstructor => ({
        id: i.id,
        name: i.user?.name ?? "Faculty Member",
        qualification: i.qualification ?? null,
      }),
    );

  return {
    department: {
      id: department.id,
      name: department.name,
      code: department.code,
    },
    courses,
    instructors,
    currentSemester: null,
    sections: [],
  };
}
