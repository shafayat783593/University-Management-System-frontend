import z from "zod";

export const loginSchema =z.object({
	email: z.string().email(),
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
    .email("Invalid email address"),

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