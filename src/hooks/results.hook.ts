import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadSectionResultPdf,
  downloadTranscriptPdf,
  emailSectionResultSheet,
  emailTranscript,
  getSectionResultSheet,
  getTranscript,
} from "@/api";
import { getMyEnrollments } from "@/api/enrollments.api";

export interface MyComposedResult {
  sectionId: string;
  enrollmentStatus: string;
  course: { code: string; title: string };
  semester: { id: string; name: string };
  exams: Array<{
    id: string;
    title: string;
    examType: string;
    totalMarks: number;
    marksObtained: number | null;
    status: string;
  }>;
}

export function useAllMyResults() {
  return useQuery({
    queryKey: ["results", "my"],
    queryFn: async () => {
      const enrollments = await getMyEnrollments();
      const results: MyComposedResult[] = [];
      for (const enrollment of enrollments) {
        try {
          const sheet = await getSectionResultSheet(enrollment.section.id);
          results.push({
            sectionId: enrollment.section.id,
            enrollmentStatus: enrollment.status,
            course: enrollment.section.course,
            semester: enrollment.section.semester,
            exams: sheet.exams.map((exam) => ({
              id: exam.id,
              title: exam.title,
              examType: exam.examType,
              totalMarks: exam.totalMarks,
              marksObtained: exam.marksObtained,
              status: exam.status,
            })),
          });
        } catch {
          // Skip sections where result fetch fails
        }
      }
      return results;
    },
    staleTime: 60 * 1000,
  });
}

export function useTranscript() {
  return useQuery({
    queryKey: ["transcript"],
    queryFn: getTranscript,
    staleTime: 60 * 1000,
  });
}

export function useSectionResultSheet(sectionId: string) {
  return useQuery({
    queryKey: ["result-sheet", sectionId],
    queryFn: () => getSectionResultSheet(sectionId),
    staleTime: 60 * 1000,
  });
}

export function useDownloadTranscript() {
  return useMutation({
    mutationFn: (studentIdCode: string) => downloadTranscriptPdf(studentIdCode),
  });
}

export function useEmailTranscript() {
  return useMutation({ mutationFn: emailTranscript });
}

export function useDownloadSectionResult() {
  return useMutation({
    mutationFn: ({
      courseCode,
      sectionId,
    }: {
      courseCode: string;
      sectionId: string;
    }) => downloadSectionResultPdf(courseCode, sectionId),
  });
}

export function useEmailSectionResult() {
  return useMutation({
    mutationFn: (sectionId: string) => emailSectionResultSheet(sectionId),
  });
}
