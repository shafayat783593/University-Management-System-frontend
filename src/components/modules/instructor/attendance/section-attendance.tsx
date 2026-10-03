"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import type { AttendanceStatus } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateAttendanceSession,
  useMarkAttendance,
  useSectionAttendance,
  useSectionEnrollments,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Task 18: create session → mark present/absent → view history.
export default function SectionAttendance({ sectionId }: { sectionId: string }) {
  const [date, setDate] = useState(todayInput);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  const roster = useSectionEnrollments(sectionId);
  const history = useSectionAttendance(sectionId);
  const createSession = useCreateAttendanceSession(sectionId);
  const mark = useMarkAttendance(sectionId);

  const students = roster.data ?? [];
  const sessions = history.data ?? [];
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // Open a session for marking: prefill from its saved records, rest PRESENT.
  function openSession(sessionId: string) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const filled: Record<string, AttendanceStatus> = {};
    for (const s of students) filled[s.studentId] = "PRESENT";
    for (const r of session.records) filled[r.studentId] = r.status;
    setMarks(filled);
    setActiveSessionId(sessionId);
  }

  function handleCreate() {
    if (!date) {
      toast.error("Please pick a date.");
      return;
    }
    createSession.mutate(new Date(date).toISOString(), {
      onSuccess: (session) => {
        toast.success("Session created. Now mark attendance below.");
        openSession(session.id);
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Could not create session.")),
    });
  }

  function setAll(status: AttendanceStatus) {
    const filled: Record<string, AttendanceStatus> = {};
    for (const s of students) filled[s.studentId] = status;
    setMarks(filled);
  }

  function handleSubmit() {
    if (!activeSession) return;
    const records = students.map((s) => ({
      studentId: s.studentId,
      status: marks[s.studentId] ?? "PRESENT",
    }));
    mark.mutate(
      { sessionId: activeSession.id, records },
      {
        onSuccess: () => toast.success("Attendance saved."),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Could not save.")),
      },
    );
  }

  const loading = roster.isLoading || history.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Attendance"
        subtitle="Create a session for a date, then mark everyone present or absent in one go."
      />

      <DashboardPanel title="New session">
        <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1 text-sm font-medium">
            <label htmlFor="att-date">Date</label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={createSession.isPending}
          >
            {createSession.isPending ? "Creating…" : "Create session"}
          </Button>
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Sessions"
        subtitle="Past sessions — click Mark to edit attendance."
      >
        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sessions yet. Create one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((s) => {
              const present = s.records.filter(
                (r) => r.status === "PRESENT",
              ).length;
              const selected = s.id === activeSessionId;
              return (
                <li
                  key={s.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${selected ? "border-primary" : ""}`}
                >
                  <span className="text-sm font-semibold">
                    {formatDay(s.date)}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {present}/{s.records.length} present
                    </span>
                  </span>
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => openSession(s.id)}
                  >
                    Mark
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardPanel>

      {activeSession ? (
        <DashboardPanel
          title={`Mark — ${formatDay(activeSession.date)}`}
          subtitle="One toggle per student, submitted as a single batch."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAll("PRESENT")}
            >
              All present
            </Button>
          }
        >
          {students.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No enrolled students in this section.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => {
                    const status = marks[s.studentId] ?? "PRESENT";
                    return (
                      <TableRow key={s.studentId}>
                        <TableCell>
                          <span className="block text-sm font-semibold">
                            {s.student.user.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {s.student.studentIdCode ?? s.student.user.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1.5">
                            <Button
                              size="sm"
                              variant={
                                status === "PRESENT" ? "default" : "outline"
                              }
                              onClick={() =>
                                setMarks((m) => ({
                                  ...m,
                                  [s.studentId]: "PRESENT",
                                }))
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                status === "ABSENT"
                                  ? "destructive"
                                  : "outline"
                              }
                              onClick={() =>
                                setMarks((m) => ({
                                  ...m,
                                  [s.studentId]: "ABSENT",
                                }))
                              }
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button onClick={handleSubmit} disabled={mark.isPending}>
                  {mark.isPending ? "Saving…" : "Submit attendance"}
                </Button>
                {activeSession.records.length > 0 ? (
                  <span className="ml-3">
                    <Badge variant="secondary">
                      {activeSession.records.length} already saved
                    </Badge>
                  </span>
                ) : null}
              </div>
            </>
          )}
        </DashboardPanel>
      ) : null}
    </div>
  );
}
