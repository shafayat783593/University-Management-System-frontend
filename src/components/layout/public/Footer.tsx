import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-card text-foreground">
      {/* Top Banner / Newsletter CTA */}
      <div className="border-b border-border/60 bg-muted/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Stay Informed with Campus Notifications
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Receive updates regarding admission deadlines, scholarships, and examination routines.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email for campus notifications"
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Contact Information */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Slogan */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="size-5" />
              </span>
              <div>
                <span className="block text-base font-bold tracking-tight text-foreground">
                  Northfield University
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Management & Academic Portal
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Empowering students through rigorous academic curricula, world-class faculty
              mentorship, and a streamlined digital campus from admissions to graduation.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="size-4" />
              <span>Approved by University Grants Commission (UGC)</span>
            </div>

            {/* Social Media Links with inline SVG icons */}
            <div className="mt-6 flex items-center gap-2.5 text-muted-foreground">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.4 9.74V9.93H5.06v8.57h2.8z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-medium sm:text-sm">
              <li>
                <Link href="/#programs" className="text-muted-foreground hover:text-primary transition-colors">
                  Academic Programs
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="text-muted-foreground hover:text-primary transition-colors">
                  Notices & Circulars
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Apply as Student
                </Link>
              </li>
              <li>
                <Link href="/instructors/apply" className="text-muted-foreground hover:text-primary transition-colors">
                  Join as Instructor
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Student Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-medium sm:text-sm">
              <li>
                <Link href="/student/programs" className="text-muted-foreground hover:text-primary transition-colors">
                  Course Enrollment
                </Link>
              </li>
              <li>
                <Link href="/student/payments/my-fees" className="text-muted-foreground hover:text-primary transition-colors">
                  bKash Fee Payment
                </Link>
              </li>
              <li>
                <Link href="/student/results/transcript" className="text-muted-foreground hover:text-primary transition-colors">
                  Download Transcripts
                </Link>
              </li>
              <li>
                <Link href="/student/id-card" className="text-muted-foreground hover:text-primary transition-colors">
                  Digital Student ID
                </Link>
              </li>
              <li>
                <Link href="/account-verify" className="text-muted-foreground hover:text-primary transition-colors">
                  Verify Email (OTP)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contact & Campus
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span>Plot 15, University Ave, Dhaka 1229, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>+880 1700-000000 / +880 2 9876543</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>admissions@northfield.edu.bd</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-primary" />
                <span>Sun – Thu: 8:30 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/60 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {currentYear} Northfield University. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/system-status" className="hover:text-primary transition-colors">
              System Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
