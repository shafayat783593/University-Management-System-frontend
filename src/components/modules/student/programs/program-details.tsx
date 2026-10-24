"use client";

import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartmentDetails, useMyAdmissionApplication } from "@/hooks";
import { usePublicDepartmentCards } from "@/hooks/public.hook";
import { formatBDT } from "@/lib/format";
import { getApiErrorMessage } from "@/hooks/auth.hook";

// "Enroll" checks admission confirmation first (Task 12):
// not confirmed → my-fees banner, otherwise → enrollments.
function EnrollButton({ semesterId }: { semesterId?: string }) {
  const router = useRouter();
  const appQuery = useMyAdmissionApplication();

  function go() {
    if (appQuery.isLoading) return;
    if (appQuery.isError) {
      toast.error(getApiErrorMessage(appQuery.error, "Could not check your application."));
      return;
    }
    if (!appQuery.data?.admissionConfirmed) {
      toast.error("Pay your admission fee to confirm admission", {
        description: "Confirm admission first, then enroll.",
      });
      router.push("/student/payments/my-fees");
      return;
    }
    router.push(semesterId ? `/student/enrollments?semesterId=${semesterId}` : "/student/enrollments");
  }

  return (
    <Button type="button" size="sm" onClick={go} disabled={appQuery.isLoading}>
      {appQuery.isLoading ? "Checking…" : "Enroll"}
    </Button>
  );
}

export default function ProgramDetails({ id }: { id: string }) {
  const query = useDepartmentDetails(id);
  const publicCards = usePublicDepartmentCards();
  const feeSchedule = (publicCards.data?.departments ?? []).find((d) => d.id === id)?.feeSchedule ?? [];
  const tuition = feeSchedule.find((f) => f.calcMethod === "PER_CREDIT");
  const fixed = feeSchedule.filter((f) => f.calcMethod !== "PER_CREDIT");

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
      <div className="flex flex-col gap-6">
        <Link href="/student/programs" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          All programs
        </Link>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load this program</p>
          <p className="text-[13px] text-muted-foreground">{getApiErrorMessage(query.error, "Try again in a moment.")}</p>
          <button type="button" onClick={() => query.refetch()} className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { department, courses, instructors, currentSemester, sections } = query.data;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/student/programs" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        All programs
      </Link>

      <DashboardPageHeader title={department.name} subtitle={department.code} />

      {feeSchedule.length > 0 ? (
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-[15px] font-bold">Fee schedule</h2>
          {tuition ? (
            <p className="mt-2 text-sm">
              Tuition: <strong>{formatBDT(tuition.amount)}</strong> <span className="text-muted-foreground">/ credit</span>
            </p>
          ) : null}
          {fixed.length > 0 ? (
            <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {fixed.map((f) => (
                <li key={f.itemType} className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-1.5">
                  <span className="capitalize">{f.label}</span>
                  <strong className="text-foreground tabular-nums">{formatBDT(f.amount)}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        {currentSemester ? (
          <p className="text-sm">
            <span className="font-semibold">{currentSemester.name}</span>
            <span className="text-muted-foreground"> · enrollment open</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No open semester right now — sections will appear once enrollment opens.</p>
        )}
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-[15px] font-bold">Instructors</h2>
        {instructors.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No approved instructors listed yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((ins) => (
              <li key={ins.id} className="rounded-xl border p-3">
                <p className="text-sm font-semibold">{ins.name}</p>
                {ins.qualification ? <p className="text-xs text-muted-foreground">{ins.qualification}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-[15px] font-bold">Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No courses published for this department yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {courses.map((course) => (
              <li key={course.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border p-3 text-sm">
                <p className="font-semibold">
                  <span className="mr-2 text-xs font-bold text-primary">{course.code}</span>
                  {course.title}
                </p>
                <span className="text-xs text-muted-foreground">{course.creditHours} credits</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-[15px] font-bold">Open sections ({sections.length})</h2>
        {sections.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No sections in the current semester yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {sections.map((section) => {
              const full = section.enrolledCount >= section.capacity;
              return (
                <li key={section.id} className="flex flex-col gap-2 rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-primary">{section.course.code}</p>
                      <p className="text-sm font-bold">{section.course.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="size-3.5" />
                        {section.instructorName} · {section.enrolledCount}/{section.capacity} seats
                        {section.schedule ? ` · ${section.schedule}` : ""}
                      </p>
                    </div>
                    <Badge variant={full ? "destructive" : "success"}>{full ? "Full" : "Open"}</Badge>
                  </div>
                  <div className="mt-1">
                    {full ? (
                      <Button type="button" size="sm" disabled>Full</Button>
                    ) : (
                      <EnrollButton semesterId={currentSemester?.id} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
