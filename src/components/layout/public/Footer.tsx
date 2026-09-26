import Link from "next/link";
import { GraduationCap } from "lucide-react";

const exploreLinks = [
  { title: "Home", href: "/" },
  { title: "Announcements", href: "/announcements" },
  { title: "Apply as Student", href: "/register" },
  { title: "Join as Instructor", href: "/instructor-apply" },
];

const accountLinks = [
  { title: "Login", href: "/login" },
  { title: "Register", href: "/register" },
  { title: "Verify Email", href: "/account-verify" },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-[15px] font-bold tracking-tight">UniManage</span>
          </Link>
          <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            University Management System — admissions, enrollments, attendance,
            results and payments in one place.
          </p>
        </div>

        <nav aria-label="Explore" className="flex flex-col gap-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Explore
          </p>
          {exploreLinks.map((l) => (
            <Link
              key={l.title}
              href={l.href}
              className="w-fit py-1 text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              {l.title}
            </Link>
          ))}
        </nav>

        <nav aria-label="Account" className="flex flex-col gap-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Account
          </p>
          {accountLinks.map((l) => (
            <Link
              key={l.title}
              href={l.href}
              className="w-fit py-1 text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              {l.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} UniManage. All rights reserved.</p>
          <p>Admissions open — apply as a student or instructor.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
