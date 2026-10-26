// src/app/terms/page.tsx
import type { Metadata } from "next";
import { LegalLayout, type LegalSection } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the University Management System.",
};

// TODO: replace the bracketed placeholders and have the text reviewed by your institution / a lawyer.
const UNIVERSITY = "[University Name]";
const EMAIL = "[support@your-university.edu]";

const sections: LegalSection[] = [
  {
    title: "Acceptance of these terms",
    body: (
      <p>
        By creating an account or using the University Management System (the &ldquo;Service&rdquo;)
        operated by {UNIVERSITY}, you agree to these Terms. If you do not agree, do not use the
        Service.
      </p>
    ),
  },
  {
    title: "Accounts and eligibility",
    body: (
      <ul>
        <li>You must provide accurate information and keep it up to date.</li>
        <li>
          You may sign up with email and password or with Google. You are responsible for all
          activity under your account and for keeping your credentials secret.
        </li>
        <li>
          Instructor accounts are active only after verification by an administrator. Administrator
          accounts are created by the university.
        </li>
        <li>We may suspend or remove accounts that give false information or misuse the Service.</li>
      </ul>
    ),
  },
  {
    title: "Admission process",
    body: (
      <ul>
        <li>
          Submitting an application does not guarantee admission. Applications are reviewed by
          administrators and are either approved or rejected.
        </li>
        <li>
          Admission is confirmed, and a Student ID is issued, only after the admission invoice is
          paid in full (where an admission fee is configured).
        </li>
        <li>
          Information in your application must be true. False or forged information can lead to
          rejection or cancellation of admission.
        </li>
      </ul>
    ),
  },
  {
    title: "Fees, invoices and payments",
    body: (
      <ul>
        <li>
          Fees (application, admission, ID card, caution deposit, tuition, registration, laboratory,
          examination, library and others) are set by {UNIVERSITY} and shown on your invoices.
          Tuition is calculated per registered credit.
        </li>
        <li>
          Semester invoices may be payable in installments. Installment amounts and due dates are
          shown on the invoice and are fixed when the invoice is issued; later policy changes do not
          alter an invoice already issued, except through an administrator&rsquo;s documented
          adjustment.
        </li>
        <li>Waivers and scholarships are applied only as granted by the university.</li>
        <li>
          Payments are made through bKash. Your payment counts only when the payment is confirmed;
          you receive a receipt number. If money was deducted but your payment shows as pending, use
          the re-check option on the payments page or contact us with your bKash TrxID.
        </li>
        <li>
          Late fees may apply to an overdue installment, after any grace period, as stated in the
          installment policy.
        </li>
        <li>
          While an installment is overdue, access to some services (for example enrolling in new
          courses, results, transcripts and ID card) may be restricted until dues are cleared.
          Paying, dropping or withdrawing remain available.
        </li>
      </ul>
    ),
  },
  {
    title: "Refunds",
    body: (
      <ul>
        <li>The application fee is non-refundable, including if the application is rejected.</li>
        <li>
          The caution deposit is refundable under the university&rsquo;s rules and is handled by an
          administrator.
        </li>
        <li>
          Other refunds are made only at the university&rsquo;s discretion, only by an administrator,
          and with a recorded reason. Student self-service refunds are not currently available.
        </li>
        <li>Refunds are returned to the original payment method where possible.</li>
      </ul>
    ),
  },
  {
    title: "Academic records",
    body: (
      <p>
        Enrollment, attendance, exam results and transcripts are maintained by the university.
        Results become visible to you only after publication. If you believe a record is wrong,
        contact the university; administrators may correct records with a recorded reason.
      </p>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <ul>
        <li>Do not attempt to access other users&rsquo; data or administrator functions.</li>
        <li>Do not upload malware, unlawful content, or files you have no right to share.</li>
        <li>Do not interfere with the Service, including automated or excessive requests.</li>
        <li>Do not use another person&rsquo;s identity or payment account without permission.</li>
      </ul>
    ),
  },
  {
    title: "Uploaded content",
    body: (
      <p>
        Documents and images you upload (such as profile pictures or an instructor résumé) must be
        yours to share. You allow {UNIVERSITY} to store and use them to operate the Service and for
        academic and administrative purposes.
      </p>
    ),
  },
  {
    title: "Availability and changes",
    body: (
      <p>
        We try to keep the Service available but do not promise uninterrupted access. We may change
        features, fee structures or these Terms. When we make material changes we will update the
        date above; continuing to use the Service means you accept the updated Terms.
      </p>
    ),
  },
  {
    title: "Limitation of liability",
    body: (
      <p>
        To the extent permitted by law, {UNIVERSITY} is not liable for indirect or consequential
        losses arising from use of the Service, including delays caused by third-party providers
        such as payment, email or hosting services. Nothing here limits liability that cannot be
        limited by law.
      </p>
    ),
  },
  {
    title: "Governing law and contact",
    body: (
      <p>
        These Terms are governed by the laws of Bangladesh. Questions about these Terms:{" "}
        <a className="underline" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="[10-27-2026]"
      intro={`Please read these terms carefully. They explain the rules for using ${UNIVERSITY}'s University Management System, including admission, fees and payments.`}
      sections={sections}
      other={{ href: "/privacy", label: "Privacy Policy" }}
    />
  );
}