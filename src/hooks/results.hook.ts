import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadSectionResultPdf,
  downloadTranscriptPdf,
  emailSectionResultSheet,
  emailTranscript,
  getSectionResultSheet,
  getTranscript,
} from "@/api";

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
    mutationFn: ({ courseCode, sectionId }: { courseCode: string; sectionId: string }) =>
      downloadSectionResultPdf(courseCode, sectionId),
  });
}

export function useEmailSectionResult() {
  return useMutation({
    mutationFn: (sectionId: string) => emailSectionResultSheet(sectionId),
  });
}
