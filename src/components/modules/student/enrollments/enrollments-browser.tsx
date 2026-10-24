"use client";

import {
  BookOpen,
  CalendarDays,
  Clock,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FetchError } from "ofetch";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import type { Section } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useEnroll, useGenerateMySemesterInvoice, useSections, useSemesters } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { getApiErrorStatus } from "@/lib/apiClient";
import useDebounce from "@/hooks/searchDebounce.hook";

/* ----------------------------- Helpers ----------------------------- */

function isFull(section: Section) {
  return section.enrolledCount >= section.capacity;
}

/* --------------------------- Enroll Button -------------------------- */

function EnrollButton({ section, onAdmissionBanner, onOverdueBanner, onSectionFullBanner, onGateBanner }: { section: Section; onAdmissionBanner: () => void; onOverdueBanner: () => void; onSectionFullBanner: (id: string, course: string) => void; onGateBanner: (title: string, message: string) => void }) {
  const router = useRouter();
  const enroll = useEnroll();

  const full = isFull(section);

  const pending =
    enroll.isPending && enroll.variables?.sectionId === section.id;

  const handleEnroll = () => {
    enroll.mutate(
      {
        sectionId: section.id,
      },
      {
        onSuccess: () => {
          toast.success(
            `Enrolled in ${section.course.code} — ${section.course.title}`,
          );
        },

        onError: (error) => {
          if (error instanceof FetchError && error.status === 409) {
            onSectionFullBanner(section.id, `${section.course.code} — ${section.course.title}`);
            return;
          }

          // §2 student gates: 402 = application fee still due, 403 = admission
          // not confirmed or overdue installment (restrictOnOverdue). Pay/drop/
          // withdraw stay open — only enroll/result/transcript/ID-card block.
          if (error instanceof FetchError && error.status === 402) {
            toast.error("Application fee pending", {
              description:
                "Pay the application fee before submitting, then enroll.",
            });
            router.push(
              `/student/admission-application?returnTo=${encodeURIComponent("/student/enrollments")}`,
            );
            return;
          }

          if (error instanceof FetchError && error.status === 403) {
            const message = getApiErrorMessage(error, "");
            const lower = message.toLowerCase();
            if (lower.includes("overdue")) {
              onOverdueBanner();
              toast.error("You have overdue fees", {
                description: message,
              });
              return;
            }
            // Only route to the admission banner when the message is ACTUALLY
            // about admission. Other 403s (e.g. the enrollment window not
            // being open yet) used to fall into this branch and were replaced
            // by a misleading "pay your admission fee" message, so the real
            // reason the enroll failed was never shown.
            if (lower.includes("admission")) {
              onAdmissionBanner();
              toast.error("Admission not confirmed", {
                description: message,
              });
              return;
            }
            const gateMessage =
              message || "The enrollment window for this semester is closed.";
            onGateBanner("Enrollment is not open", gateMessage);
            // Toast too — the banner can sit above the fold, and the server's
            // wording must be visible the moment the click fails.
            toast.error("Enrollment is not open", {
              description: gateMessage,
              duration: 8000,
            });
            return;
          }

          // Direct visit (e.g. bookmark) bypassing the Programs gate:
          // no admission application yet → send them to fill it first.
          if (error instanceof FetchError && error.status === 400) {
            const message = getApiErrorMessage(error, "");
            if (message.toLowerCase().includes("admission")) {
              toast.error("Admission application needed", {
                description:
                  "Submit your admission application first, then enroll.",
              });
              router.push(
                `/student/admission-application?returnTo=${encodeURIComponent("/student/enrollments")}`,
              );
              return;
            }
          }

          toast.error(
            <span className="font-semibold">
              {getApiErrorMessage(error, "Could not enroll in this section")}
            </span>,
          );
        },
      },
    );
  };

  if (section.semester.status !== "OPEN") {
    return (
      <Button type="button" disabled className="w-full sm:w-auto">
        Enrollment closed
      </Button>
    );
  }

  return (
    <Button
      type="button"
      disabled={full || enroll.isPending}
      onClick={handleEnroll}
      className="w-full sm:w-auto"
    >
      {pending ? "Enrolling…" : full ? "Full" : "Enroll"}
    </Button>
  );
}

/* ----------------------------- Section Card ------------------------- */

function SectionCard({ section, onAdmissionBanner, onOverdueBanner, onSectionFullBanner, onGateBanner }: { section: Section; onAdmissionBanner: () => void; onOverdueBanner: () => void; onSectionFullBanner: (id: string, course: string) => void; onGateBanner: (title: string, message: string) => void }) {
  const full = isFull(section);

  const percentage = Math.min(
    100,
    Math.round((section.enrolledCount / Math.max(section.capacity, 1)) * 100),
  );

  const instructorName = section.instructor?.user?.name ?? "TBA";

  return (
    <li className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      {/* Course information */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wide text-primary">
            {section.course.code}
          </p>

          <h3 className="truncate text-[15px] font-bold tracking-tight">
            {section.course.title}
          </h3>
        </div>

        <Badge variant={full ? "destructive" : "success"}>
          {section.enrolledCount} / {section.capacity} seats
        </Badge>
      </div>

      {/* Seat progress */}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={
            full
              ? "h-full rounded-full bg-destructive"
              : "gradient-brand h-full rounded-full"
          }
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Section information */}
      <dl className="flex flex-col gap-2 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" />
          <span className="truncate">{section.schedule}</span>
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="size-4 shrink-0" />
          <span className="truncate">{instructorName}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">{section.semester.name}</span>
        </div>
      </dl>

      {/* Enrollment */}
      <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />

          {full
            ? "No seats left"
            : `${section.capacity - section.enrolledCount} seats left`}
        </span>

        <EnrollButton section={section} onAdmissionBanner={onAdmissionBanner} onOverdueBanner={onOverdueBanner} onSectionFullBanner={onSectionFullBanner} onGateBanner={onGateBanner} />
      </div>
    </li>
  );
}

/* --------------------- Generate Invoice Button --------------------- */

// §11 — after enrolling, the student generates their own semester invoice
// here (idempotent: an existing invoice comes back unchanged).
function GenerateInvoiceButton({ semesterId }: { semesterId: string }) {
  const generate = useGenerateMySemesterInvoice();

  function handleClick() {
    if (!semesterId) {
      toast.error("Pick a semester first.");
      return;
    }
    generate.mutate(semesterId, {
      onSuccess: (invoice) => {
        toast.success(
          `Invoice ${invoice.invoiceNumber ?? ""} ready — ${invoice.installments.length} installment(s).`.trim(),
        );
      },
      onError: (error) => {
        const status = getApiErrorStatus(error);
        if (status === 403) {
          toast.error("Admission not confirmed", {
            description: getApiErrorMessage(error, "Confirm your admission first."),
          });
          return;
        }
        toast.error(getApiErrorMessage(error, "Could not generate invoice."));
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!semesterId || generate.isPending}
      onClick={handleClick}
      className="h-9"
    >
      {generate.isPending ? "Generating…" : "Generate semester invoice"}
    </Button>
  );
}

/* -------------------------- Main Component -------------------------- */

export default function EnrollmentsBrowser() {
  const searchParams = useSearchParams();
  const preselectedSemester = searchParams.get("semesterId") ?? "";
  const router = useRouter();

  /* Persistent error banners for 403/409 gates */
  const [admissionBanner, setAdmissionBanner] = useState(false);
  const [overdueBanner, setOverdueBanner] = useState(false);
  const [sectionFullBanner, setSectionFullBanner] = useState<{ id: string; course: string } | null>(null);
  /* Any other server-side 403 (e.g. the enrollment window is not open) — the
     server's own wording is shown verbatim so nothing is swallowed. */
  const [gateBanner, setGateBanner] = useState<{ title: string; message: string } | null>(null);

  /* Dismiss banner handlers */
  const dismissAdmission = () => setAdmissionBanner(false);
  const dismissOverdue = () => setOverdueBanner(false);
  const dismissSectionFull = () => setSectionFullBanner(null);
  const dismissGate = () => setGateBanner(null);

  /* -------------------------- Semesters -------------------------- */

  const semestersQuery = useSemesters();

  const semesters = semestersQuery.data?.items ?? [];

  /*
   * semesterId সবসময় ID রাখবে।
   *
   * Example:
   * semesterId = "abc-123"
   *
   * User কিন্তু Select-এ দেখবে:
   * "Fall 2026"
   */
  const [semesterId, setSemesterId] = useState(preselectedSemester);

  /* ---------------------------- Search ---------------------------- */

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  /* ----------------------- Default Semester ----------------------- */

  useEffect(() => {
    if (semesterId || semesters.length === 0) {
      return;
    }

    // প্রথমে OPEN semester খুঁজবে
    const openSemester = semesters.find(
      (semester) => semester.status === "OPEN",
    );

    // OPEN না থাকলে প্রথম semester
    const defaultSemester = openSemester ?? semesters[0];

    // এখানে অবশ্যই ID set হবে
    setSemesterId(defaultSemester.id);
  }, [semesters, semesterId]);

  /* -------------------- Selected Semester -------------------- */

  const selectedSemester = semesters.find(
    (semester) => semester.id === semesterId,
  );

  /* -------------------------- Sections -------------------------- */

  const sectionsQuery = useSections({
    semesterId: semesterId || undefined,
    searchTerm: debouncedSearch.trim() || undefined,
    enabled: Boolean(semesterId),
  });

  const sections = sectionsQuery.data?.items ?? [];

  /* ---------------------------- UI ---------------------------- */

  return (
    <div className="flex flex-col gap-6">
      {/* Persistent banners */}
      {admissionBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
          <div className="flex-1">
            <p className="font-semibold text-destructive">Pay your admission fee to confirm admission</p>
            <p className="text-[13px] text-muted-foreground">Confirm your admission (application → approval → fee) before enrolling.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => router.push("/student/payments/my-fees")}>
              Go to fees
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissAdmission}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {overdueBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
          <div className="flex-1">
            <p className="font-semibold text-destructive">You have overdue fees</p>
            <p className="text-[13px] text-muted-foreground">Clear your overdue installment before enrolling.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => router.push("/student/payments/my-fees")}>
              Go to fees
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissOverdue}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {gateBanner && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border-2 border-destructive/50 bg-destructive/15 p-4 shadow-soft"
        >
          <div className="flex-1">
            <p className="text-[15px] font-bold text-destructive">
              {gateBanner.title}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-destructive">
              {gateBanner.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 font-semibold"
            onClick={dismissGate}
          >
            Dismiss
          </Button>
        </div>
      )}
      {sectionFullBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4" role="alert">
          <div className="flex-1">
            <p className="font-semibold text-warning">This section just filled up</p>
            <p className="text-[13px] text-muted-foreground">{sectionFullBanner.course} — someone took the last seat. Try another section.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissSectionFull}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Header */}
      <DashboardPageHeader
        title="Browse & enroll"
        subtitle="Pick a semester, find an open section, and reserve your seat."
        action={
          <div className="flex flex-wrap gap-2">
            <GenerateInvoiceButton semesterId={semesterId} />
            <Link
              href="/student/enrollments/my"
              className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
            >
              <BookOpen className="mr-1.5 size-4" />
              My enrollments
            </Link>
          </div>
        }
      />

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end sm:gap-4 sm:p-5">
        {/* Semester */}
        <div className="grid flex-1 gap-1.5">
          <label htmlFor="semester" className="text-[13px] font-semibold">
            Semester
          </label>

          {semestersQuery.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : semestersQuery.isError ? (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-destructive">
                Could not load semesters.
              </p>

              <button
                type="button"
                onClick={() => semestersQuery.refetch()}
                className="h-8 rounded-xl border px-3 text-[13px] font-medium hover:bg-muted"
              >
                Retry
              </button>
            </div>
          ) : (
            <Select
              value={semesterId}
              onValueChange={(v) => setSemesterId(v ?? "")}
            >
              <SelectTrigger id="semester" className="h-9 w-full">
                <SelectValue placeholder="Select a semester" />
              </SelectTrigger>

              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name}

                    {semester.status === "OPEN"
                      ? " · Open"
                      : ` · ${semester.status}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Search */}
        <div className="grid flex-1 gap-1.5">
          <label htmlFor="search" className="text-[13px] font-semibold">
            Search courses
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Code, title, or schedule…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Semester Status */}
        {selectedSemester && (
          <Badge
            variant={
              selectedSemester.status === "OPEN" ? "success" : "secondary"
            }
            className="w-fit shrink-0"
          >
            {selectedSemester.status}
          </Badge>
        )}
      </div>

      {/* Closed semester message */}
      {selectedSemester && selectedSemester.status !== "OPEN" ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] font-medium text-warning">
          {selectedSemester.name} is {selectedSemester.status.toLowerCase()} —
          browsing is allowed, but enrollment only works while a semester is
          open.
        </p>
      ) : null}

      {/* Sections */}
      {!semesterId ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="size-5" />
          </span>

          <p className="text-sm font-semibold">
            {semestersQuery.isLoading
              ? "Loading semesters…"
              : "No semester selected"}
          </p>

          <p className="max-w-sm text-[13px] text-muted-foreground">
            {semesters.length === 0 && !semestersQuery.isLoading
              ? "No semesters exist yet. Ask an admin to create one."
              : "Choose a semester above to see its sections."}
          </p>
        </div>
      ) : sectionsQuery.isLoading ? (
        /* Loading */
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-24" />
            </li>
          ))}
        </ul>
      ) : sectionsQuery.isError ? (
        /* Error */
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load sections</p>

          <p className="text-[13px] text-muted-foreground">
            {getApiErrorMessage(
              sectionsQuery.error,
              "Check your connection and try again.",
            )}
          </p>

          <button
            type="button"
            onClick={() => sectionsQuery.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      ) : sections.length === 0 ? (
        /* No sections */
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <BookOpen className="size-5" />
          </span>

          <p className="text-sm font-semibold">No sections found</p>

          <p className="max-w-sm text-[13px] text-muted-foreground">
            {debouncedSearch
              ? `Nothing matches "${debouncedSearch}" in ${
                  selectedSemester?.name ?? "this semester"
                }. Try a different search.`
              : `There are no sections in ${
                  selectedSemester?.name ?? "this semester"
                } yet.`}
          </p>
        </div>
      ) : (
        /* Sections list */
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} onAdmissionBanner={() => setAdmissionBanner(true)} onOverdueBanner={() => setOverdueBanner(true)} onSectionFullBanner={(id, course) => setSectionFullBanner({ id, course })} onGateBanner={(title, message) => setGateBanner({ title, message })} />
          ))}
        </ul>
      )}
    </div>
  );
}
