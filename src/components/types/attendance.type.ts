export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceCourse {
  id: string;
  code: string;
  title: string;
}

export interface AttendanceSection {
  id: string;
  course: AttendanceCourse;
}

export interface AttendanceSession {
  id: string;
  date: string;
  sectionId: string;
  section: AttendanceSection;
}

export interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  sessionId: string;
  studentId: string;
  session: AttendanceSession;
}

// Instructor side (Task 18) -------------------------------------

export interface RosterStudent {
  id: string;
  studentIdCode?: string | null;
  user: { name: string; email: string };
}

export interface SectionEnrollment {
  id: string;
  studentId: string;
  student: RosterStudent;
}

export interface SessionRecord {
  studentId: string;
  status: AttendanceStatus;
  student?: RosterStudent | null;
}

export interface SectionAttendanceSession {
  id: string;
  date: string;
  records: SessionRecord[];
}

// Student results (Task 14) ---------------------------------------

export interface TranscriptCourse {
  courseCode: string;
  creditHours: number;
  gradePoint: number | null;
  withdrawn?: boolean;
}

export interface TranscriptSemester {
  semesterId: string;
  semesterName: string;
  gpa: number | null;
  courses: TranscriptCourse[];
}

export interface Transcript {
  student: {
    studentIdCode: string;
    user: { name: string; email: string };
  };
  semesters: TranscriptSemester[];
  cgpa: number | null;
}

export interface SheetExam {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
  marksObtained: number | null;
  status: string;
}

export interface SectionResultSheet {
  course: { code: string; title: string };
  semester: { name: string };
  exams: SheetExam[];
}

// One section + all of the student's records in it.
export interface SectionAttendanceGroup {
  sectionId: string;
  courseCode: string;
  courseTitle: string;
  records: AttendanceRecord[];
  presentCount: number;
  totalCount: number;
  percentage: number;
}
