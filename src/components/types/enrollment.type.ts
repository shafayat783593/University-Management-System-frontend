export type SemesterStatus = "UPCOMING" | "OPEN" | "CLOSED";

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: string;
  status: SemesterStatus;
  enrollmentStart?: string | null;
  enrollmentEnd?: string | null;
  examWeekStart?: string | null;
  examWeekEnd?: string | null;
  resultPublishDate?: string | null;
  _count?: {
    sections?: number;
    fees?: number;
  };
}

export interface SectionCourse {
  id: string;
  code: string;
  title: string;
  credits?: number;
  departmentId?: string;
}

export interface SectionSemester {
  id: string;
  name: string;
  status: SemesterStatus;
}

export interface SectionInstructorUser {
  id?: string;
  name: string;
  email?: string;
}

export interface SectionInstructor {
  id: string;
  user?: SectionInstructorUser;
}

export interface Section {
  id: string;
  courseId: string;
  semesterId: string;
  instructorId: string;
  capacity: number;
  enrolledCount: number;
  schedule: string;
  course: SectionCourse;
  semester: SectionSemester;
  instructor?: SectionInstructor;
  _count?: {
    enrollments?: number;
    attendanceSessions?: number;
    exams?: number;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: "ENROLLED" | "DROPPED" | "WITHDRAWN";
  enrolledAt?: string;
  section: Section;
}
