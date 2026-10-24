// §3: POST /auth/register — studentIdCode must NOT be sent. The server issues
// a placeholder; the real Student ID is generated at admission confirmation.
export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface ChangePasswordValue {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type UserRole = "SUPERADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface InstructorProfileInfo {
  id: string;
  departmentId: string;
  qualification?: string | null;
  verificationStatus?: string;
  // Backend may add more fields — allow reading them.
  [key: string]: unknown;
}

export interface MeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  imageUrl?: string | null;
  emailVerified: boolean;
  needPasswordChange?: boolean;
  studentProfile?: StudentProfileInfo | null;
  instructorProfile?: InstructorProfileInfo | null;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface StudentProfileInfo {
  userId: string;
  departmentId: string;
  // §3: null until admission is confirmed (GET /auth/me masks the placeholder).
  studentIdCode: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  bloodGroup?: string | null;
  previousInstitute?: string | null;
  group?: string | null;
}

// POST /auth/complete-profile — Google sign-ups only pick a department
// (+optional phone). Academic background goes through /admission-applications.
export interface CompleteProfilePayload {
  departmentId: string;
  phone?: string;
}

// DEPRECATED — backend `GET /departments/:id/details` now returns
// `DepartmentFullDetails` (see `src/api/department.api.ts`).
// Kept only so old imports don't break.
export interface DepartmentDetailsInstructor {
  id: string;
  qualification?: string | null;
  user: { name: string; email: string; imageUrl?: string | null };
}

export interface DepartmentDetailsExam {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
}

export interface DepartmentDetailsSection {
  id: string;
  capacity: number;
  enrolledCount: number;
  schedule?: string | null;
  semester: { id: string; name: string; status: string };
  instructor?: { id: string; user: { name: string } } | null;
  exams: DepartmentDetailsExam[];
}

export interface DepartmentDetailsCourse {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  prerequisites?: { id: string; code: string; title: string }[];
  sections: DepartmentDetailsSection[];
}

export interface DepartmentDetails {
  department: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    tuitionFeePerSemester?: number | null;
  };
  stats: {
    totalCourses: number;
    totalInstructors: number;
    totalStudents: number;
  };
  instructors: DepartmentDetailsInstructor[];
  courses: DepartmentDetailsCourse[];
}

export interface UpdateStudentProfilePayload {
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
}
