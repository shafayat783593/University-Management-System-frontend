import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExam, submitExamResults } from "@/api";

export function useCreateExam(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; examType: string; totalMarks: number }) =>
      createExam({ sectionId, ...payload }),
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
