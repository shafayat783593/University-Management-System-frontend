"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, ScrollText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
import { useAuth, useInstructorSections } from "@/hooks";


export default function MySections() {
  const { data: me } = useAuth();
  const instructorId = me?.data?.instructorProfile?.id;
  const list = useInstructorSections(instructorId);
  const rows = list.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My sections"
        subtitle={
          list.data?.meta
            ? `${list.data.meta.total} sections assigned to you`
            : "Sections assigned to you."
        }
      />

      <DashboardPanel title="All sections">
        {!instructorId ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No instructor profile found on your account.
          </p>
        ) : list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="font-semibold">Could not load your sections.</p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
              <BookOpen className="size-5" />
            </span>
            <p className="text-sm font-semibold">No sections assigned yet</p>
            <p className="text-[13px] text-muted-foreground">
              Ask your admin to assign you to a section.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">
                    {row.course.code}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {row.course.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.semester.name}
                    <span className="ml-2">
                      <Badge
                        variant={
                          row.semester.status === "OPEN"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {row.semester.status}
                      </Badge>
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.enrolledCount}/{row.capacity}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {row.schedule || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/instructor/sections/${row.id}/attendance`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <ClipboardCheck className="size-4" />
                        Attendance
                      </Link>
                      <Link
                        href={`/instructor/sections/${row.id}/exams`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <ScrollText className="size-4" />
                        Exams
                      </Link>
                    </div>
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
