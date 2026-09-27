export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  patient: {
    contactNumber?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface  ChangePasswordValue  {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};


export type UserRole = "SUPERADMIN" |"ADMIN"|"INSTRUCTOR"|"STUDENT"

export interface MeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  imageUrl?: string | null;
  emailVerified: boolean;
  needPasswordChange?: boolean;
  studentProfile?: StudentProfileInfo | null;
  instructorProfile?: Record<string, unknown> | null;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface StudentProfileInfo {
  userId: string;
  departmentId: string;
  studentIdCode: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  bloodGroup?: string | null;
}

export interface UpdateStudentProfilePayload {
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
}

