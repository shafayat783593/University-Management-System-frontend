import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBulkExams, createExam, submitExamResults } from "@/api";

export function useCreateExam(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      examType: string;
      totalMarks: number;
      examDate?: string;
    }) => createExam({ sectionId, ...payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

// Bulk create — one submit for many exams across own sections.
export function useBulkCreateExams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBulkExams,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useSubmitExamResults() {
  return useMutation({
    mutationFn: ({
      examId,
      records,
    }: {
      examId: string;
      records: { studentId: string; marksObtained: number }[];
    }) => submitExamResults(examId, records),
  });
}
