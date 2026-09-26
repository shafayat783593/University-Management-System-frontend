export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SemesterCalendarEvent {
  type: string;
  label: string;
  start: string | null;
  end: string | null;
}

export interface SemesterCalendar {
  semesterId: string;
  semesterName: string;
  events: SemesterCalendarEvent[];
}
