"use client";

import { useState } from "react";
import { Check, FileText, MailCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useReviewInstructorApplication } from "@/hooks";
import type { InstructorApplication } from "@/components/types";

export default function InstructorReviewSheet({
  application,
  onClose,
}: {
  application: InstructorApplication | null;
  onClose: () => void;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [mode, setMode] = useState<"APPROVED" | "REJECTED" | null>(null);
  const reviewMutation = useReviewInstructorApplication();

  const open = application !== null;

  const close = () => {
    setRejectionReason("");
    setMode(null);
    reviewMutation.reset();
    onClose();
  };

  const submit = (status: "APPROVED" | "REJECTED") => {
    if (!application) return;
    if (status === "REJECTED" && rejectionReason.trim().length < 5) {
      toast.error("Rejection reason required", { description: "Please write at least 5 characters." });
      return;
    }
    reviewMutation.mutate(
      {
        instructorId: application.id,
        payload: {
          verificationStatus: status,
          rejectionReason:
            status === "REJECTED" ? rejectionReason.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(status === "APPROVED"
                ? "Instructor approved"
                : "Application rejected", { description: status === "APPROVED"
                ? "Login credentials were emailed to the instructor."
                : "The applicant has been notified by email." });
          close();
        },
        onError: (err) => {
          toast.error("Review failed", { description: err instanceof Error ? err.message : "Please try again." });
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {application ? (
          <>
            <SheetHeader>
              <SheetTitle>Review application</SheetTitle>
              <SheetDescription>
                Approve to create login credentials, or reject with a reason.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {application.user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">
                    {application.user.name}
                  </p>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {application.user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    application.verificationStatus === "APPROVED"
                      ? "success"
                      : application.verificationStatus === "REJECTED"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {application.verificationStatus}
                </Badge>
                <Badge
                  variant={application.user.emailVerified ? "success" : "secondary"}
                >
                  <MailCheck className="size-3" />
                  {application.user.emailVerified ? "Email verified" : "Email unverified"}
                </Badge>
              </div>

              <Separator />

              <dl className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="font-semibold">
                    {application.department.name} ({application.department.code})
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Applied</dt>
                  <dd className="font-semibold">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Qualification</dt>
                  <dd className="font-semibold">
                    {application.qualification || "—"}
                  </dd>
                </div>
                {application.rejectionReason ? (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Rejection reason</dt>
                    <dd className="font-semibold">{application.rejectionReason}</dd>
                  </div>
                ) : null}
              </dl>

              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <FileText />
                  View resume
                </a>
              ) : null}

              {!application.user.emailVerified ? (
                <p className="rounded-xl bg-warning/10 px-3 py-2 text-[13px] text-warning">
                  This applicant has not verified their email yet. Review is blocked
                  on the server until verification completes.
                </p>
              ) : null}

              {application.verificationStatus === "PENDING" ? (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant={mode === "REJECTED" ? "outline" : "default"}
                      className="flex-1"
                      disabled={reviewMutation.isPending}
                      onClick={() => {
                        setMode("APPROVED");
                        submit("APPROVED");
                      }}
                    >
                      {reviewMutation.isPending ? <Spinner /> : <Check />}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={reviewMutation.isPending}
                      onClick={() => setMode(mode === "REJECTED" ? null : "REJECTED")}
                    >
                      <X />
                      Reject
                    </Button>
                  </div>

                  {mode === "REJECTED" ? (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="rejectionReason"
                        className="text-[13px] font-semibold"
                      >
                        Rejection reason
                      </label>
                      <Input
                        id="rejectionReason"
                        placeholder="e.g. Resume does not meet requirements…"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        disabled={reviewMutation.isPending}
                        onClick={() => submit("REJECTED")}
                      >
                        {reviewMutation.isPending ? <Spinner /> : <X />}
                        Confirm rejection
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="rounded-xl bg-muted px-3 py-2 text-[13px] text-muted-foreground">
                  This application was already {application.verificationStatus.toLowerCase()}.
                </p>
              )}
            </div>

            <SheetFooter />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
