"use client";

import { Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useDownloadSectionResult,
  useDownloadTranscript,
  useEmailSectionResult,
  useEmailTranscript,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

// Shared Download PDF + Email buttons for transcript pages.
export function TranscriptActions({ studentIdCode }: { studentIdCode: string }) {
  const download = useDownloadTranscript();
  const email = useEmailTranscript();

  function handleDownload() {
    download.mutate(studentIdCode, {
      onSuccess: () => toast.success("Transcript downloaded."),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Download failed.")),
    });
  }

  function handleEmail() {
    email.mutate(undefined, {
      onSuccess: () => toast.success("Transcript emailed to you."),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Email failed.")),
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={download.isPending}
      >
        <Download className="size-4" />
        {download.isPending ? "Downloading…" : "Download PDF"}
      </Button>
      <Button onClick={handleEmail} disabled={email.isPending}>
        <Mail className="size-4" />
        {email.isPending ? "Sending…" : "Email me a copy"}
      </Button>
    </div>
  );
}

// Same buttons for one section's result sheet.
export function SectionResultActions({
  courseCode,
  sectionId,
}: {
  courseCode: string;
  sectionId: string;
}) {
  const download = useDownloadSectionResult();
  const email = useEmailSectionResult();

  function handleDownload() {
    download.mutate(
      { courseCode, sectionId },
      {
        onSuccess: () => toast.success("Result sheet downloaded."),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Download failed.")),
      },
    );
  }

  function handleEmail() {
    email.mutate(sectionId, {
      onSuccess: () => toast.success("Result sheet emailed to you."),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Email failed.")),
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={download.isPending}
      >
        <Download className="size-4" />
        {download.isPending ? "Downloading…" : "Download PDF"}
      </Button>
      <Button onClick={handleEmail} disabled={email.isPending}>
        <Mail className="size-4" />
        {email.isPending ? "Sending…" : "Email me a copy"}
      </Button>
    </div>
  );
}
