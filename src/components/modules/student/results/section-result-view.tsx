"use client";

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
import { useSectionResultSheet } from "@/hooks";
import { SectionResultActions } from "./result-actions";

function statusVariant(status: string) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "secondary" as const;
}

// Task 14: one section's result sheet + PDF download + email copy.
export default function SectionResultView({ sectionId }: { sectionId: string }) {
  const query = useSectionResultSheet(sectionId);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">Could not load result sheet</p>
        <p className="max-w-sm text-[13px] text-muted-foreground">
          You can only view sections you are enrolled in.
        </p>
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

  const sheet = query.data;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={`${sheet.course.code} — ${sheet.course.title}`}
        subtitle={sheet.semester.name}
        action={
          <SectionResultActions
            courseCode={sheet.course.code}
            sectionId={sectionId}
          />
        }
      />

      <DashboardPanel title="Exams">
        {sheet.exams.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No exams in this section yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Marks</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheet.exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-semibold">{exam.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{exam.examType}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {exam.marksObtained === null
                      ? "—"
                      : `${exam.marksObtained}/${exam.totalMarks}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant(exam.status)}>
                      {exam.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardPanel>
    </div>
  );
}
