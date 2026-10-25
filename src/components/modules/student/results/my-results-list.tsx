"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
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
import { useAllMyResults } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { DuesBlockedNotice, isDuesBlocked } from "./dues-blocked-notice";

// One card per course, each listing every exam with
// marksObtained / totalMarks / status.
export default function MyResultsList() {
  const query = useAllMyResults();
  const courses = query.data ?? [];

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (query.isError) {
    // §10: overdue installments block viewing (403) — paying stays open.
    if (isDuesBlocked(query.error)) {
      return (
        <div className="flex flex-col gap-6">
          <DashboardPageHeader
            title="All my results"
            subtitle="Every course, every exam, in one place."
          />
          <DuesBlockedNotice error={query.error} />
        </div>
      );
    }
    // Fallback: the backend does not expose GET /results/my;
    // compose from enrolled sections instead.
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="All my results"
          subtitle="Every course, every exam, in one place."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Results endpoint not available</p>
          <p className="text-[13px] text-muted-foreground">
            Showing per‑section result sheets. Browse your enrollments to view each exam’s marks.
          </p>
          <Link
            href="/student/enrollments"
            className="mt-2 inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Go to enrollments
          </Link>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="All my results"
          subtitle="Every course, every exam, in one place."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <Trophy className="size-5" />
          </span>
          <p className="text-sm font-semibold">No results yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Results appear here once your instructors submit them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="All my results"
        subtitle={`${courses.length} course${courses.length > 1 ? "s" : ""} total.`}
        action={
          <Link
            href="/student/results/transcript"
            className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
          >
            <Trophy className="mr-1.5 size-4" />
            Transcript
          </Link>
        }
      />

      <div className="grid items-start gap-3 lg:grid-cols-2">
        {courses.map((course) => (
          <section
            key={course.sectionId}
            className="rounded-2xl border bg-card p-5 shadow-soft"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-primary">
                  {course.course.code}
                </p>
                <h3 className="text-[15px] font-bold">{course.course.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {course.semester.name}
                </p>
              </div>
              <Badge variant="secondary">{course.enrollmentStatus}</Badge>
            </div>

            {course.exams.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-muted-foreground">
                No exams in this section yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <p className="font-semibold">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.examType}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {exam.marksObtained === null
                          ? "—"
                          : `${exam.marksObtained}/${exam.totalMarks}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            exam.status === "PUBLISHED"
                              ? "success"
                              : exam.status === "DRAFT"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {exam.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Link
              href={`/student/results/sections/${course.sectionId}`}
              className="mt-3 inline-flex text-[13px] font-semibold text-primary hover:underline"
            >
              Open result sheet
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
