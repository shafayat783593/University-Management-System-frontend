import z from "zod";

export const loginSchema =z.object({
	email: z.email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must Minimum 8 Charcters Long")
		.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
		.regex(/[a-z]/, "Password must contain atleast 1 LowerCase letter")
		.regex(/[0-9]/, "Password must contain atleast 1 Number")
		.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),

})




export const StudentRegisterSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Invalid email address")),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  departmentId: z
    .string()
    .min(1, "Please select a department"),

  studentIdCode: z
    .string()
    .min(1, "Student ID is required"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^01[3-9]\d{8}$/.test(val),
      "Invalid Bangladeshi phone number (e.g., 017XXXXXXXX)"
    ),
});

export type StudentRegisterFormValues = z.infer<typeof StudentRegisterSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must Minimum 8 Charcters Long")
      .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
      .regex(/[a-z]/, "Password must contain atleast 1 LowerCase letter")
      .regex(/[0-9]/, "Password must contain atleast 1 Number")
      .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((val) => val.newPassword !== val.oldPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} must be under ${max} characters`)
    .optional();

// Task 10 — every field optional, nothing required.
export const studentInfoSchema = z.object({
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^01[3-9]\d{8}$/.test(val),
      "Invalid Bangladeshi phone number (e.g., 017XXXXXXXX)",
    ),
  address: optionalText(255, "Address"),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(new Date(val).getTime()), "Invalid date"),
  guardianName: optionalText(100, "Guardian name"),
  guardianPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^01[3-9]\d{8}$/.test(val),
      "Invalid Bangladeshi phone number (e.g., 017XXXXXXXX)",
    ),
  bloodGroup: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^(A|B|AB|O)[+-]$/i.test(val.trim()),
      "Blood group looks like O+, A-, B+, AB-, …",
    ),
});

export type StudentInfoFormValues = z.infer<typeof studentInfoSchema>;