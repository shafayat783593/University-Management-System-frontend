"use client";

import { BadgeCheck, Check, Eye, FileText, MailCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table.pagination";
import type { InstructorApplication } from "@/components/types";
import { cn } from "@/lib/utils";

function statusVariant(status: InstructorApplication["verificationStatus"]) {
  if (status === "APPROVED") return "success" as const;
  if (status === "REJECTED") return "destructive" as const;
  return "warning" as const;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InstructorApprovalTable({
  applications,
  page,
  totalPages,
  onPageChange,
  onReview,
  reviewingId,
}: {
  applications: InstructorApplication[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReview: (application: InstructorApplication) => void;
  reviewingId?: string | null;
}) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
          <BadgeCheck className="size-5" />
        </span>
        <p className="text-sm font-semibold">No instructor applications</p>
        <p className="max-w-sm text-[13px] text-muted-foreground">
          No applications match this filter. Try a different status or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instructor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {app.user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-44 truncate text-sm font-semibold">
                      {app.user.name}
                    </span>
                    <span className="block max-w-44 truncate text-xs text-muted-foreground">
                      {app.user.email}
                    </span>
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[13px] font-medium">
                  {app.department.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {app.department.code}
                </span>
              </TableCell>
              <TableCell>
                <span className="block max-w-40 truncate text-[13px]">
                  {app.qualification || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(app.verificationStatus)}>
                  {app.verificationStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={app.user.emailVerified ? "success" : "secondary"}>
                  <MailCheck className="size-3" />
                  {app.user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
                {formatDate(app.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(app)}
                  >
                    <Eye />
                    Review
                  </Button>
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <FileText />
                      Resume
                    </a>
                  ) : null}
                  {app.verificationStatus === "PENDING" ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs text-muted-foreground",
                        reviewingId === app.id && "opacity-60"
                      )}
                    >
                      {reviewingId === app.id ? (
                        <>
                          <Check className="size-3 animate-pulse" />
                          Working…
                        </>
                      ) : (
                        <>
                          <X className="hidden" />
                        </>
                      )}
                    </span>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center pt-1">
        <TablePagination
          page={page}
          totalPages={totalPages}
          handlePageChange={onPageChange}
        />
      </div>
    </div>
  );
}
