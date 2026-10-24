import {
  getPublicCalendar,
  getPublicDepartments,
  getPublicFaculty,
  getPublicStats,
} from "@/api/public.api";
import { getPublishedAnnouncements } from "@/api/announcements.api";
import type { Announcement } from "@/components/types";
import Hero from "@/components/modules/public/home/hero";
import StatsCounter from "@/components/modules/public/home/stats-counter";
import ProgramsDepartments from "@/components/modules/public/home/programs-departments";
import AdmissionSteps from "@/components/modules/public/home/admission-steps";
import LatestAnnouncements from "@/components/modules/public/home/latest-announcements";
import AcademicCalendarSection from "@/components/modules/public/home/academic-calendar";
import FeaturesWhyUs from "@/components/modules/public/home/features-why-us";
import FacultyHighlight, {
  type InstructorItem,
} from "@/components/modules/public/home/faculty-highlight";
import FAQSection from "@/components/modules/public/home/faq-section";

export const revalidate = 60;

// Task 6B — landing data comes from public endpoints (no auth).
// Each helper already falls back to [] / null, so the page never crashes.

async function getAnnouncementsPreview(): Promise<Announcement[]> {
  try {
    const { items } = await getPublishedAnnouncements({ page: 1, limit: 3 });
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, deptRes, facultyRows, calendar, announcements] = await Promise.all([
    getPublicStats(),
    getPublicDepartments(),
    getPublicFaculty(4),
    getPublicCalendar(),
    getAnnouncementsPreview(),
  ]);

  const facultyPreview: InstructorItem[] = facultyRows.map((f) => ({
    id: f.id,
    name: f.user?.name ?? "Faculty Member",
    department: f.department?.name ?? "Academic Faculty",
    qualification: f.qualification ?? "Distinguished Professor",
    photoUrl: f.user?.imageUrl ?? null,
  }));

  return (
    <div className="flex flex-col">
      <Hero />

      <StatsCounter initialCounts={stats} />

      <ProgramsDepartments
        departments={deptRes.departments}
        semesterName={deptRes.semester?.name ?? null}
      />

      <AdmissionSteps />

      <LatestAnnouncements announcements={announcements} />

      <AcademicCalendarSection calendar={calendar as never} />

      <FeaturesWhyUs />

      <FacultyHighlight instructors={facultyPreview} />

      <FAQSection />
    </div>
  );
}
