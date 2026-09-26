export type InstructorVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InstructorApplicationUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  imageUrl?: string | null;
  createdAt: string;
}

export interface InstructorApplicationDepartment {
  id: string;
  name: string;
  code: string;
}

export interface InstructorApplication {
  id: string;
  userId: string;
  departmentId: string;
  qualification?: string | null;
  resumeUrl?: string | null;
  verificationStatus: InstructorVerificationStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: InstructorApplicationUser;
  department: InstructorApplicationDepartment;
}

export interface InstructorApplicationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetInstructorApplicationsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  verificationStatus?: InstructorVerificationStatus | "ALL";
  departmentId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReviewInstructorPayload {
  verificationStatus: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
