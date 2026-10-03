import type { ApiResponse, Exam } from "@/components/types";
import apiClient from "@/lib/apiClient";

export interface CreateExamPayload {
  sectionId: string;
  title: string;
  examType: string;
  totalMarks: number;
}

export async function createExam(payload: CreateExamPayload) {
  const res = await apiClient<ApiResponse<Exam>>("/exams", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function submitExamResults(
  examId: string,
  records: { studentId: string; marksObtained: number }[],
) {
  const res = await apiClient(`/results/exams/${examId}/submit`, {
    method: "POST",
    body: { records },
  });
  return res.data;
}
