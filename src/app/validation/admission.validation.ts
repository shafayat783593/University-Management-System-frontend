import z from "zod";

// All admission fields are required. Year/GPA stay strings in the form (HTML inputs return strings) and are
// converted to numbers in the submit handler.
const requiredYear = z
  .string()
  .trim()
  .refine(
    (v) => /^\d{4}$/.test(v) && +v >= 1990 && +v <= 2100,
    "Year must be between 1990 and 2100",
  );

const requiredGpa = z
  .string()
  .trim()
  .refine((v) => {
    if (!v) return false;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 5;
  }, "GPA is required and must be between 0 and 5");

export const admissionApplicationSchema = z.object({
  previousInstitution: z.string().trim().min(2, "Previous institution is required"),
  sscBoard: z.string().trim().min(1, "SSC board is required"),
  sscYear: requiredYear,
  sscGpa: requiredGpa,
  hscBoard: z.string().trim().min(1, "HSC board is required"),
  hscYear: requiredYear,
  hscGpa: requiredGpa,
  guardianOccupation: z.string().trim().min(1, "Guardian occupation is required"),
  presentAddress: z.string().trim().min(1, "Present address is required"),
  permanentAddress: z.string().trim().min(1, "Permanent address is required"),
});

export type AdmissionApplicationFormValues = z.infer<
  typeof admissionApplicationSchema
>;