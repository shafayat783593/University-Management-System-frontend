import { InstructorRoute } from "@/components/routes/instructor.route";

const prefix = "/instructor";

export const admissionsRoute: InstructorRoute = [
  {
    title: "Admissions",
    items: [
      { title: "All applications", url: `${prefix}/admissions`, icon: "Users" },
      { title: "Submitted", url: `${prefix}/admissions/submitted`, icon: "BookOpen" },
      { title: "Approved", url: `${prefix}/admissions/approved`, icon: "CheckCircle" },
      { title: "Rejected", url: `${prefix}/admissions/rejected`, icon: "Reject" },
    ],
  },
];
