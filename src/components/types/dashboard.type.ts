export interface NextStep {
  kind:
    | "PAY_OVERDUE"
    | "PAY_APPLICATION_FEE"
    | "START_APPLICATION"
    | "APPLICATION_UNDER_REVIEW"
    | "APPLICATION_REJECTED"
    | "PAY_ADMISSION"
    | "NO_OPEN_SEMESTER"
    | "ENROLL"
    | "GENERATE_SEMESTER_INVOICE"
    | "ALL_SET";
  title: string;
  description: string;
  href: string | null;
  tone: "danger" | "warning" | "info" | "success";
}

export interface IDashboardAnnouncement {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
}

export interface IDashboardSemester {
  id: string;
  name: string;
  status: string;
  enrollmentStart: string | null;
  enrollmentEnd: string | null;
}

export interface IDashboardClass {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  sectionId: string;
  course: { id: string; code: string; title: string; creditHours: number };
  instructorName?: string;
}

export interface StudentDashboard {
  profile: {
    name: string;
    email: string;
    imageUrl: string | null;
    department: { id: string; name: string; code: string };
    studentIdCode: string | null;
    admissionConfirmed: boolean;
  };
  semester: IDashboardSemester | null;
  nextStep: NextStep;
  admission: {
    applicationStatus: "SUBMITTED" | "APPROVED" | "REJECTED" | null;
    rejectionReason: string | null;
    applicationFee: { required: boolean; amount: number; isPaid: boolean };
    admissionInvoice: {
      id: string;
      invoiceNumber: string;
      status: string;
      payableAmount: number;
      paidAmount: number;
      outstandingBalance: number;
    } | null;
    steps: { key: string; label: string; state: "done" | "current" | "pending" | "skipped" }[];
  };
  billing: {
    totalFees: number;
    totalPaid: number;
    outstandingBalance: number;
    nextInstallment: unknown | null;
    overdueInstallments: unknown[];
    invoiceCount: number;
    hasSemesterInvoice: boolean;
  };
  academics: {
    enrolledCourses: number;
    enrolledCredits: number;
    courses: {
      sectionId: string;
      code: string;
      title: string;
      creditHours: number;
      schedule: string | null;
      instructorName: string;
    }[];
    attendance: {
      totalClasses: number;
      present: number;
      absent: number;
      percentage: number | null;
      lowAttendance: boolean;
      byCourse: { code: string; title: string; total: number; present: number; percentage: number }[];
    };
  };
  routine: { today: IDashboardClass[]; nextClass: IDashboardClass | null; week: IDashboardClass[] };
  announcements: IDashboardAnnouncement[];
}

export interface InstructorDashboard {
  profile: {
    name: string;
    email: string;
    imageUrl: string | null;
    department: { id: string; name: string; code: string };
    qualification: string | null;
    verificationStatus: string;
  };
  semester: IDashboardSemester | null;
  stats: {
    sections: number;
    students: number;
    classesToday: number;
    upcomingExams: number;
    pendingResultSubmissions: number;
  };
  sections: {
    id: string;
    course: { id: string; code: string; title: string; creditHours: number };
    capacity: number;
    enrolledStudents: number;
    schedule: string | null;
    attendanceSessions: number;
    lastAttendanceDate: string | null;
    attendanceTakenToday: boolean;
    exams: number;
  }[];
  routine: { today: IDashboardClass[]; nextClass: IDashboardClass | null };
  upcomingExams: {
    id: string;
    title: string;
    examType: string;
    examDate: string | null;
    totalMarks: number;
    sectionId: string;
    course: { code: string; title: string };
  }[];
  pendingActions: {
    attendanceToTake: { sectionId: string; courseCode: string; courseTitle: string; startTime: string }[];
    resultsToSubmit: {
      examId: string;
      title: string;
      sectionId: string;
      courseCode: string;
      submitted: number;
      enrolled: number;
    }[];
  };
  announcements: IDashboardAnnouncement[];
}
