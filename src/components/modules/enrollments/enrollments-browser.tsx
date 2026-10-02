
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

import { useEnroll, useSections, useSemesters } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import useDebounce from "@/hooks/searchDebounce.hook";

/* ----------------------------- Helpers ----------------------------- */

function isFull(section: Section) {
  return section.enrolledCount >= section.capacity;
}

/* --------------------------- Enroll Button -------------------------- */

function EnrollButton({ section }: { section: Section }) {
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
            toast.error("This section just filled up", {
              description:
                "Someone took the last seat. Try another section of this course.",
            });

            return;
          }

          toast.error(
            getApiErrorMessage(error, "Could not enroll in this section"),
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

function SectionCard({ section }: { section: Section }) {
  const full = isFull(section);

  const percentage = Math.min(
    100,
    Math.round(
      (section.enrolledCount / Math.max(section.capacity, 1)) * 100,
    ),
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

        <EnrollButton section={section} />
      </div>
    </li>
  );
}

/* -------------------------- Main Component -------------------------- */

export default function EnrollmentsBrowser() {
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
  const [semesterId, setSemesterId] = useState("");

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
      {/* Header */}
      <DashboardPageHeader
        title="Browse & enroll"
        subtitle="Pick a semester, find an open section, and reserve your seat."
        action={
          <Link
            href="/student/enrollments/my"
            className="inline-flex h-9 items-center rounded-2xl border px-3 text-sm font-medium hover:bg-muted"
          >
            <BookOpen className="mr-1.5 size-4" />
            My enrollments
          </Link>
        }
      />

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end sm:gap-4 sm:p-5">
        {/* Semester */}
        <div className="grid flex-1 gap-1.5">
          <label
            htmlFor="semester"
            className="text-[13px] font-semibold"
          >
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
              onValueChange={setSemesterId}
            >
              <SelectTrigger
                id="semester"
                className="h-9 w-full"
              >
                <SelectValue placeholder="Select a semester" />
              </SelectTrigger>

              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.id}
                    value={semester.id}
                  >
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
          <label
            htmlFor="search"
            className="text-[13px] font-semibold"
          >
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
              selectedSemester.status === "OPEN"
                ? "success"
                : "secondary"
            }
            className="w-fit shrink-0"
          >
            {selectedSemester.status}
          </Badge>
        )}
      </div>

      {/* Closed semester message */}
      {selectedSemester &&
      selectedSemester.status !== "OPEN" ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] font-medium text-warning">
          {selectedSemester.name} is{" "}
          {selectedSemester.status.toLowerCase()} — browsing is
          allowed, but enrollment only works while a semester is
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
            {semesters.length === 0 &&
            !semestersQuery.isLoading
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
          <p className="text-sm font-semibold">
            Could not load sections
          </p>

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

          <p className="text-sm font-semibold">
            No sections found
          </p>

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
            <SectionCard
              key={section.id}
              section={section}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
