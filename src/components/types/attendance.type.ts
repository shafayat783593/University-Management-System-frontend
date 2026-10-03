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
