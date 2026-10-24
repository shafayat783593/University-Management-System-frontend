import type {
  ApiResponse,
  SectionResultSheet,
  Transcript,
} from "@/components/types";
import apiClient, { downloadBlobFile } from "@/lib/apiClient";

function downloadPdf(path: string, filename: string) {
  return downloadBlobFile(path, filename);
}

/* Transcript ----------------------------------------------------- */

export async function getTranscript() {
  const res = await apiClient<ApiResponse<Transcript>>("/results/transcript");
  return res.data;
}

export function downloadTranscriptPdf(studentIdCode: string) {
  return downloadPdf(
    "/results/transcript/download",
    `transcript-${studentIdCode}.pdf`,
  );
}

export async function emailTranscript() {
  const res = await apiClient("/results/transcript/email", { method: "POST" });
  return res.data;
}

/* One section's result sheet -------------------------------------- */

export async function getSectionResultSheet(sectionId: string) {
  const res = await apiClient<ApiResponse<SectionResultSheet>>(
    `/results/sections/${sectionId}/my-result`,
  );
  return res.data;
}

export function downloadSectionResultPdf(
  courseCode: string,
  sectionId: string,
) {
  return downloadPdf(
    `/results/sections/${sectionId}/my-result/download`,
    `result-sheet-${courseCode}.pdf`,
  );
}

export async function emailSectionResultSheet(sectionId: string) {
  const res = await apiClient(
    `/results/sections/${sectionId}/my-result/email`,
    { method: "POST" },
  );
  return res.data;
}

export interface MyExamResult {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
  examDate?: string | null;
  marksObtained: number | null;
  status: string;
}

export interface MyCourseResults {
  sectionId: string;
  enrollmentStatus: string;
  course: { code: string; title: string };
  semester: { id: string; name: string };
  exams: MyExamResult[];
}

export async function getAllMyResults() {
  const res = await apiClient<ApiResponse<MyCourseResults[]>>("/results/my");
  return res.data ?? [];
}
