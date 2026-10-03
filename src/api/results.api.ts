import type {
  ApiResponse,
  SectionResultSheet,
  Transcript,
} from "@/components/types";
import apiClient from "@/lib/apiClient";

// Fetch a PDF endpoint and trigger a browser download (never render it).
// Uses native fetch because our ofetch client is typed for JSON only.
async function downloadPdf(path: string, filename: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const res = await fetch(`${baseUrl}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error("Download failed.");
  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
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

export function downloadSectionResultPdf(courseCode: string, sectionId: string) {
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
