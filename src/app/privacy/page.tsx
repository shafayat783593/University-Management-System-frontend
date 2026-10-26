// src/app/privacy/page.tsx
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the University Management System collects and uses personal data.",
};

// TODO: replace the bracketed placeholders and have the text reviewed by your institution / a lawyer.
const UNIVERSITY = "[University Name]";
const EMAIL = "[privacy@your-university.edu]";

const sections: LegalSection[] = [
  {
    title: "Who we are",
    body: (
      <p>
        {UNIVERSITY} operates the University Management System. This policy explains what personal
        data we collect, why, who we share it with and what choices you have.
      </p>
    ),
  },
  {
    title: "Data we collect",
    body: (
      <ul>
        <li>
          <strong>Account:</strong> name, email, password (stored only as a hash), sign-in method
          (email or Google), profile picture.
        </li>
        <li>
          <strong>Student profile:</strong> department, phone number, Student ID (issued after
          admission is confirmed).
        </li>
        <li>
          <strong>Admission application:</strong> previous institution, SSC and HSC board, year and
          GPA, guardian occupation, present and permanent address.
        </li>
        <li>
          <strong>Academic records:</strong> enrollments, attendance, exam marks, results and
          transcripts.
        </li>
        <li>
          <strong>Billing:</strong> invoices, installments, payment records, bKash payment and
          transaction IDs, receipt numbers, refunds, waivers.
        </li>
        <li>
          <strong>Instructors:</strong> qualification and the résumé you upload for verification.
        </li>
        <li>
          <strong>Technical:</strong> authentication cookies, and audit logs of important
          administrative and financial actions (who did what and when).
        </li>
      </ul>
    ),
  },
  {
    title: "What we do not collect",
    body: (
      <p>
        We never see or store your bKash PIN or wallet password. You enter them only on bKash&rsquo;s
        own pages. We do not sell your personal data.
      </p>
    ),
  },
  {
    title: "How we use your data",
    body: (
      <ul>
        <li>To create and secure your account and verify your email.</li>
        <li>To review admission applications and issue Student IDs.</li>
        <li>To manage enrollment, attendance, exams, results and transcripts.</li>
        <li>To issue invoices, process payments and refunds, and send receipts.</li>
        <li>To send service emails such as verification codes, admission confirmation and results.</li>
        <li>To prevent fraud and keep an audit trail of financial and administrative actions.</li>
      </ul>
    ),
  },
  {
    title: "Who we share data with",
    body: (
      <>
        <p>We share data only as needed to run the Service:</p>
        <ul>
          <li>
            <strong>bKash</strong> to process payments (payment amount and our invoice reference).
          </li>
          <li>
            <strong>Google</strong> if you choose Google sign-in.
          </li>
          <li>
            <strong>Cloud and infrastructure providers</strong> that host the application, database,
            file storage (profile images and résumés) and email delivery on our behalf.
          </li>
          <li>
            <strong>University staff</strong> with the relevant role: administrators see applications
            and billing; instructors see only the students in their sections.
          </li>
          <li>Authorities, where we are required to by law.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        We use essential cookies to keep you signed in (access and refresh tokens). They are
        HTTP-only so scripts on the page cannot read them. We do not use advertising cookies. If you
        block these cookies you will not be able to sign in.
      </p>
    ),
  },
  {
    title: "Retention",
    body: (
      <p>
        Academic and financial records are kept for as long as the university needs them for
        academic, legal and accounting purposes. Verification codes expire within minutes. [Add your
        institution&rsquo;s exact retention periods here.]
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        Passwords are hashed, sessions use signed tokens in HTTP-only cookies, and administrative
        and financial actions are logged. No system is perfectly secure; please use a strong,
        unique password and tell us promptly if you suspect misuse of your account.
      </p>
    ),
  },
  {
    title: "Your choices and rights",
    body: (
      <ul>
        <li>You can view and update much of your profile information in the app.</li>
        <li>
          You can ask us to correct inaccurate data, or to delete data we are not required to keep.
          Academic and financial records may have to be retained.
        </li>
        <li>
          Contact us at{" "}
          <a className="underline" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>{" "}
          for any request.
        </li>
      </ul>
    ),
  },
  {
    title: "Children",
    body: (
      <p>
        The Service is for university applicants and students. If you believe someone has given us
        data in a way that is not permitted, contact us and we will review it.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy. We will change the date above when we do, and for material
        changes we will notify users through the Service.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="[10-27-2026]"
      intro={`This policy describes how ${UNIVERSITY} handles personal data in the University Management System.`}
      sections={sections}
      other={{ href: "/terms", label: "Terms of Service" }}
    />
  );
}