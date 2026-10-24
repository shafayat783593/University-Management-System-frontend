import z from "zod";

// Task 13 — POST/PATCH /admission-applications.
// Only `previousInstitution` is required; everything else is optional.
// Year/GPA stay strings in the form (HTML inputs return strings) and are
// converted to numbers in the submit handler.
const optionalYear = z
  .string()
  .optional()
  .refine(
    (v) => !v || (/^\d{4}$/.test(v.trim()) && +v >= 1990 && +v <= 2100),
    "Year must be between 1990 and 2100",
  );

const optionalGpa = z
  .string()
  .optional()
  .refine((v) => {
    if (!v) return true;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 5;
  }, "GPA must be between 0 and 5");

export const admissionApplicationSchema = z.object({
  previousInstitution: z.string().min(2, "Previous institution is required"),
  sscBoard: z.string().optional(),
  sscYear: optionalYear,
  sscGpa: optionalGpa,
  hscBoard: z.string().optional(),
  hscYear: optionalYear,
  hscGpa: optionalGpa,
  guardianOccupation: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
});

export type AdmissionApplicationFormValues = z.infer<
  typeof admissionApplicationSchema
>;
