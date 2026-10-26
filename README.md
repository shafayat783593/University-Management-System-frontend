# University Management System

A full-stack university platform: online admission with approval, invoice-based fee and payment management (bKash), course enrollment, attendance, exams and results, transcripts, and role-based dashboards for students, instructors and administrators.

- **Backend:** Express 5 · TypeScript · Prisma 7 · PostgreSQL · Redis
- **Frontend:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · TanStack Query
- **Repos:** [`University-Management-System-server`](https://github.com/shafayat783593/University-Management-System-server) (this API) and the Next.js client

## Features

| Area | What it does |
|---|---|
| **Auth** | Email + password with OTP email verification, Google sign-in, JWT access/refresh tokens in HTTP-only cookies, password reset, role-based access (`STUDENT`, `INSTRUCTOR`, `ADMIN`) |
| **Admission** | Student creates an account → optionally pays an application fee → submits an application → admin approves/rejects (with reason) → student pays the admission invoice → admission confirmed and a Student ID (e.g. `CSE-26-0001`) is generated |
| **Billing** | Admin-defined fee policies (flat or per-credit tuition, scoped globally, by department or by semester), installment policies, waivers and scholarships, adjustments, late fees, cancellations |
| **Payments** | bKash tokenized checkout, idempotent callback handling, PDF receipts, admin refunds (with optional charge reversal), payment re-verification |
| **Academics** | Departments, courses (with prerequisites), semesters, sections, enrollments, class routines |
| **Attendance and exams** | Attendance sessions, exams (single and bulk), result submission and publishing, admin overrides, transcript PDF (download/email) |
| **Instructors** | Public application with résumé upload, admin verification |
| **Admin** | Dashboard, announcements, reports (collection, outstanding, overdue), settings, audit log |
| **Access gates** | Admission confirmation and overdue-installment checks gate enrollment, results, transcript and ID card (paying, dropping and withdrawing are never blocked) |

## How the student journey works

```
Register / Google login
        │
  Complete profile (department + phone)
        │
  [optional] Pay application fee ──▶ bKash ──▶ /payment/callback
        │
  Submit admission application
        │
  Admin reviews: APPROVED / REJECTED (reason)
        │
  Pay admission invoice (admission + ID card + refundable caution deposit)
        │
  Admission confirmed · Student ID issued
        │
  Enroll in sections ──▶ generate semester invoice (tuition = credits × rate + fixed fees, waivers applied)
        │
  Pay installments ──▶ receipt PDF
```

## Tech stack

**Backend:** Node.js, Express 5, TypeScript, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL, Redis, Zod 4, JWT, bcryptjs, Nodemailer + EJS templates, PDFKit, Cloudinary (images and résumés), Google Auth Library, `rate-limiter-flexible`, Vitest, tsup, Biome.

**Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Base UI), react-hook-form + Zod, TanStack Query v5, ofetch, sonner, recharts.

## Project structure (backend)

```
prisma/
  schema/            # multi-file Prisma schema (user, academic, payment, announcement, enum)
  migrations/
src/
  app.ts             # Express app, CORS, route mounting (/api/v1/...)
  server.ts          # DB + Redis + SMTP connect, seeding, listen
  generated/prisma/  # generated client (git-ignored)
  app/
    config/          # env loading
    lib/             # billing math, invoice core, dues gates, bKash client, PDFs, mail, Redis
    middleware/      # auth, validateRequest, requireNoDues, error handler
    module/          # feature modules: controller / service / route / validation / interface
      auth  admission  department  course  semester  section  enrollment
      attendance  exam  result  transcript  routine  announcement
      feePolicy  invoice  payment  waiver  setting  dashboard  public  Instructor  auditlog
    templates/       # EJS emails and PDFs
    utils/           # catchAsync, sendResponse, AppError, seeds
```

All endpoints return `{ success, statusCode, message, data, meta? }`. Money is stored as `Decimal(12,2)` and calculated in integer paisa (`toMinor` / `fromMinor`); the API returns BDT numbers.

## Getting started

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL
- Redis
- An SMTP account (for OTP and receipts)
- A Cloudinary account (profile images, résumés)
- A Google OAuth client ID (Google sign-in)
- bKash tokenized checkout **sandbox** credentials (payments)

### Install and run
```bash
git clone https://github.com/shafayat783593/University-Management-System-server.git
cd University-Management-System-server
npm install                       # also runs `prisma generate`
cp .env.example .env              # then fill in the values below
npx prisma migrate dev            # create/update the database
npm run dev                       # http://localhost:<PORT>
```
On startup the server connects to PostgreSQL, Redis and SMTP, then seeds a tester admin from the `TESTER_ADMIN_*` variables. If any connection fails, it exits.

### Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start with watch mode (`tsx`) |
| `npm run build` | Bundle with `tsup` |
| `npm start` | Run the built server (`dist/server.js`) |
| `npm test` | Run Vitest (billing math, allocation, installment planning) |
| `npx prisma migrate dev` | Apply schema changes in development |
| `npx prisma generate` | Regenerate the client |
| `npx tsc --noEmit` | Type-check |

## Environment variables

```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000        # must equal the frontend origin exactly (CORS + cookies)
DATABASE_URL=postgresql://user:pass@localhost:5432/ums

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=

REDIS_HOST=
REDIS_PORT=
REDIS_USER=
REDIS_PASSWORD=

SMTP_USER=
SMTP_PASSWORD=
EMAIL_SENDER="University <no-reply@example.edu>"

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# bKash tokenized checkout
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_CALLBACK_URL=http://localhost:3000/payment/callback   # a FRONTEND page, not the API

# Seeded accounts
SUPER_ADMIN_NAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
TESTER_ADMIN_NAME=
TESTER_ADMIN_EMAIL=
TESTER_ADMIN_PASSWORD=
TESTER_DOCTOR_NAME=
TESTER_DOCTOR_EMAIL=
TESTER_DOCTOR_PASSWORD=
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## First-time setup (as admin)

Billing will not work until these exist. Create them in this order:

1. **Departments**, **semester** (set status `OPEN`), **courses**, then **sections** (a section needs a verified instructor).
2. **Fee policies** (global unless noted):
   | Invoice type | Item | Method | Example |
   |---|---|---|---|
   | Application | Application | Flat | ৳1,000 |
   | Admission | Admission | Flat | ৳5,000 |
   | Admission | ID card | Flat | ৳100 |
   | Admission | Caution deposit (refundable) | Flat | ৳3,000 |
   | Semester | Tuition | **Per credit** | ৳3,500 |
   | Semester | Registration / lab / exam / library | Flat | per semester |
   Admission policies must **not** be scoped to a semester: an admission invoice is created before any semester is known.
3. *(Optional)* **Installment policy** for a semester or as the default. Without one, a semester invoice is a single payment.
4. **Settings:** `applicationFeeRequired` (pay before submitting), `admissionPaymentRequiredToEnroll` (confirm admission only after payment).

## Testing payments locally

1. Use bKash **sandbox** credentials. Set `BKASH_CALLBACK_URL` to your frontend `/payment/callback` page.
2. Create a fresh student → pay application fee → submit → approve as admin → pay the admission invoice → enroll.
3. A student whose admission was already confirmed cannot be re-tested; use a new account or reset `admissionConfirmedAt` and `studentIdCode` for that profile.

## API overview

Base path: `/api/v1`

| Path | Purpose |
|---|---|
| `/auth` | register, verify email, login, Google login, refresh, profile, ID card |
| `/admission-applications` | student application, admin review |
| `/departments` `/courses` `/semesters` `/sections` | academic structure |
| `/enrollments` `/attendance` `/exams` `/results` `/routines` `/transcript` | academic operations |
| `/fee-policies` | fee policies and installment policies |
| `/waivers` | scholarships, waivers, discounts |
| `/invoices` | invoices, semester generation, adjustments, cancellation, late fees, reports |
| `/payments` | init, bKash callback, verify, history, receipts, refunds, collection report |
| `/settings` | system settings |
| `/announcements` `/public` `/dashboard` `/instructors` | content and dashboards |

Full request/response shapes live in `API_CONTRACT.md`; frontend scope in `PRD.md` and `TASKS.md`.

## Deployment (Vercel)

`vercel.json` and the `vercel-build` script (`prisma generate`) are included. Set all environment variables in the project settings, point `FRONTEND_URL` at the deployed frontend origin, and run `npx prisma migrate deploy` against the production database. Because the frontend and API are on different origins, cookies need `SameSite=None; Secure` and HTTPS.

## Known limitations

- No background jobs: late fees must be applied manually (`POST /invoices/late-fees/apply`); unpaid admission invoices never expire; stuck payments are re-checked only on demand.
- Dropping a course after a semester invoice is issued does not shrink the invoice; an admin must adjust or cancel and regenerate it.
- No cash or bank payment entry; bKash only.
- No student self-service refunds. The application fee is non-refundable.
- Approval emails are not sent (only the admission-confirmed email).
- The audit-log route exists but may not be mounted in `app.ts`.
- Enrollment window dates (`enrollmentStart` / `enrollmentEnd`) are not yet enforced.
- Integration tests and bKash sandbox end-to-end tests are not included; unit tests cover the billing math.

## Roadmap

Scheduled jobs (late fees, reminders, invoice expiry), manual payment entry, refund-policy rules, approval emails, enrollment-window enforcement, richer reports, and integration tests.

## License

ISC