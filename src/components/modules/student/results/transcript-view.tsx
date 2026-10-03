"use client";

import { GraduationCap } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranscript } from "@/hooks";
import { TranscriptActions } from "./result-actions";

// Task 14: JSON transcript view + PDF download + email copy.
export default function TranscriptView() {
  const query = useTranscript();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load transcript</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const transcript = query.data;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Transcript"
        subtitle={`${transcript.student.user.name} · ${transcript.student.studentIdCode}`}
        action={
          <TranscriptActions
            studentIdCode={transcript.student.studentIdCode}
          />
        }
      />

      <DashboardPanel title="Overall">
        <p className="text-[26px] font-bold tracking-tight">
          {transcript.cgpa ?? "—"}
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            CGPA
          </span>
        </p>
      </DashboardPanel>

      {transcript.semesters.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <GraduationCap className="size-5" />
          </span>
          <p className="text-sm font-semibold">No semesters yet</p>
          <p className="text-[13px] text-muted-foreground">
            Your courses will appear here once you enroll.
          </p>
        </div>
      ) : (
        transcript.semesters.map((sem) => (
          <DashboardPanel
            key={sem.semesterId}
            title={sem.semesterName}
            subtitle={
              sem.gpa === null ? "GPA not ready yet" : `GPA ${sem.gpa}`
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Grade point</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sem.courses.map((c) => (
                  <TableRow key={c.courseCode}>
                    <TableCell className="font-semibold">
                      {c.courseCode}
                      {c.withdrawn ? (
                        <span className="ml-2">
                          <Badge variant="secondary">W</Badge>
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{c.creditHours}</TableCell>
                    <TableCell className="text-right">
                      {c.withdrawn ? "W" : (c.gradePoint ?? "—")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardPanel>
        ))
      )}
    </div>
  );
}
