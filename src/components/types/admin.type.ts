export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  tuitionFeePerSemester?: number | null;
}

export interface DepartmentPayload {
  name: string;
  code: string;
  description?: string;
  tuitionFeePerSemester?: number;
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

export interface AdminPayment {
  id: string;
  installmentId: string;
  amount: number;
  status: PaymentStatus;
  trxId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  installment?: {
    id: string;
    number: number;
    fee?: {
      invoiceNo?: string | null;
      type?: string | null;
      student?: {
        studentIdCode?: string | null;
        user?: { name: string; email: string } | null;
      } | null;
      semester?: { id: string; name: string } | null;
    } | null;
  } | null;
}

/** @deprecated use AdminPayment (installment-nested shape) instead. */
export type Payment = AdminPayment;

export interface PaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | "ALL";
  studentId?: string;
  semesterId?: string;
  searchTerm?: string;
}

// One fee has 1+ installments ordered by number. Fee status is derived:
// PENDING / PARTIALLY_PAID / PAID. ADMISSION = 1 non-refundable installment.
export type FeeType = "ADMISSION" | "TUITION";
export type FeeStatus = "PENDING" | "PARTIALLY_PAID" | "PAID";

export interface InstallmentPayment {
  id: string;
  status: PaymentStatus;
  trxId?: string | null;
  paidAt?: string | null;
}

export interface InvoiceItem {
  id: string;
  label: string;
  kind: string;
  amount: number;
}

export interface StudentInstallment {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  status: FeeStatus | "FAILED";
  isOverdue: boolean;
  payment?: InstallmentPayment | null;
}

export interface StudentFee {
  id: string;
  type: FeeType;
  amount: number;
  paidAmount: number;
  subtotal?: number;
  discountAmount?: number;
  adjustmentAmount?: number;
  invoiceNo?: string | null;
  status: FeeStatus;
  semester?: { id: string; name: string; enrollmentEnd?: string | null } | null;
  installments: StudentInstallment[];
  items?: InvoiceItem[];
}

export interface BkashInitResult {
  bkashURL: string;
  paymentID: string;
}

export interface Exam {
  id: string;
  sectionId: string;
  title: string;
  examType: string;
  totalMarks: number;
  examDate?: string | null;
}

export interface OverrideResultPayload {
  marksObtained: number;
  reason: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string; role: string } | null;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  actorId?: string;
  targetType?: string;
  action?: string;
  from?: string;
  to?: string;
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
