import { ArrowLeft, BookOpen, Building2, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartmentDetails } from "@/api/department.api";
import DepartmentApplyCta from "@/components/modules/public/departments/department-apply-cta";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const details = await getDepartmentDetails(id);
    return { title: `${details.department.name} | UniManage`, description: `Program details for ${details.department.name}.` };
  } catch {
    return { title: "Department | UniManage" };
  }
}

export default async function DepartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let details;
  try {
    details = await getDepartmentDetails(id);
  } catch {
    notFound();
  }

  const { department, courses, instructors, currentSemester, sections } = details;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="size-4" />
        All departments
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-3xl border bg-card p-6 shadow-soft sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Building2 className="size-3.5 text-primary" />
            {department.code}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{department.name}</h1>
          {currentSemester ? (
            <p className="mt-3 text-sm text-muted-foreground">Current semester: {currentSemester.name}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold">
              <BookOpen className="size-3.5" />
              {courses.length} courses
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold">
              <GraduationCap className="size-3.5" />
              {instructors.length} instructors
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold">
              <Users className="size-3.5" />
              {sections.length} open sections
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <DepartmentApplyCta departmentId={department.id} departmentName={department.name} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Who teaches here</h2>
        {instructors.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            No approved instructors listed for this department yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((ins) => (
              <li key={ins.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <p className="text-[15px] font-bold">{ins.name}</p>
                {ins.qualification ? <p className="mt-1 text-[13px] text-muted-foreground">{ins.qualification}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Courses</h2>
        {courses.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            No courses published for this department yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <p className="text-[15px] font-bold">
                  <span className="mr-2 text-[13px] font-bold text-primary">{course.code}</span>
                  {course.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{course.creditHours} credit hours</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Open sections</h2>
        {sections.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            No sections in the current semester yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {sections.map((sec) => (
              <li key={sec.id} className="rounded-xl border bg-card p-4 text-[13px] shadow-soft">
                <p className="font-semibold">{sec.course.code} · {sec.course.title}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {sec.schedule ?? "Schedule TBA"} · {sec.instructorName} · Seats {sec.enrolledCount}/{sec.capacity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
