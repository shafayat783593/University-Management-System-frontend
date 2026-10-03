export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface CoursePrerequisite {
  id: string;
  code: string;
  title: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  departmentId: string;
  department?: Department;
  prerequisites?: CoursePrerequisite[];
}

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface Payment {
  id: string;
  feeId: string;
  amount: number;
  status: PaymentStatus;
  trxId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  fee?: {
    student?: {
      studentIdCode?: string | null;
      user?: { name: string; email: string } | null;
    } | null;
    semester?: { name: string } | null;
  } | null;
}

export interface PaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | "ALL";
  studentId?: string;
  semesterId?: string;
  searchTerm?: string;
}

export interface Exam {
  id: string;
  sectionId: string;
  title: string;
  examType: string;
  totalMarks: number;
}

export interface OverrideResultPayload {
  marksObtained: number;
  reason: string;
}

export interface DashboardSummary {
  totals: {
    departments: number;
    courses: number;
    semesters: number;
    sections: number;
    students: number;
    instructors: number;
  };
  instructorApplications: {
    pending: number;
    approved: number;
    rejected: number;
  };
  activeSemester: { id: string; name: string; status: string } | null;
  enrollment: { totalEnrolledThisSemester: number };
  finance: {
    totalCollected: number;
    totalPending: number;
    totalFailedOrCancelled: number;
  };
}
