# University Management System — Client (Web)

Next.js frontend for the University Management System: student admission and fee payment, course enrollment, results, instructor tools (sections, attendance, exams) and the admin back office.

- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI) · TanStack Query v5 · ofetch · react-hook-form + Zod · framer-motion
- **Backend:** a separate Express API (`University-Management-System-server`). This app does nothing without it running.

## Requirements

- Node.js 20+ and npm
- The API running and reachable (see the server README), with the same migrations applied
- Server `.env`: `FRONTEND_URL` must equal this app's exact origin, and `BKASH_CALLBACK_URL` must point to this app's `/payment/callback` page

## Getting started

```bash
git clone <client-repo-url>
cd <client-folder>
npm install
npm run dev                    # http://localhost:3000
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npx tsc --noEmit` | Type-check |

## Roles and home pages

| Role | Home | Shared pages |
|---|---|---|
| Student | `/student` | `/profile`, `/logout` |
| Instructor | `/instructor` | `/profile`, `/logout` |
| Admin | `/admin` | `/profile`, `/logout` |

Each home page is driven by one dashboard endpoint (`GET /dashboard/student`, `/instructor`, `/admin`). Use `getHomePath(role)` from `src/lib/auth-redirect.ts` instead of hard-coding these paths.

## Project structure

```
src/
  app/
    (public)/
      (authentication)/
        layout.tsx
        (guest)/            # login, register — only for logged-out visitors
          layout.tsx        # <AuthGuard guestOnly>
          login/  register/
        account-verify/  instructor-apply/  instructors/
      (marketing)/          # public landing pages
    (dashboard)/            # layout with sidebar + AuthGuard; admin / instructor / student areas
    payment/                # /payment/callback — public, bKash returns here
    terms/  privacy/        # legal pages
    logout/
  components/
    auth/                   # AuthGuard, RoleGuard, AccessDenied, account gates, loading
    dashboard/  layout/  legal/  from/ (auth forms)
  modules/                  # feature code by role
    admin/                  # admissions, announcements, audit-logs, courses, dashboard,
                            # departments, fee-policies, ...
    student/  instructor/
  hooks/                    # one TanStack Query hook per resource (useGetMe, ...)
  lib/                      # api client, auth-redirect, overdue helpers, formatters
```

## Authentication and guards

- The API is on a **different origin**, so Next.js middleware cannot read the auth cookie. Guards run on the client by calling `/auth/me` through `useGetMe`.
- **`<AuthGuard>`** (dashboard layout) requires a logged-in user and applies, in order:
  1. **Password gate**: a temporary password (`needPasswordChange`) must be changed first. Only `/profile` and `/logout` stay open.
  2. **Profile gate**: a student with no `studentProfile` must finish `/complete-profile`.
  3. **Admission gate**: a student with no admission application is limited to the application pages until they apply.
- **`<AuthGuard guestOnly>`** wraps `login` and `register`. A logged-in user is redirected to their home page, and logged-out visitors see the form. Never show the form while the user query is still loading.
- **`<RoleGuard>`** keeps each area to its role and shows `AccessDenied` otherwise.
- `useGetMe` must use `retry: false` for 401s. After login, **invalidate** the `me` query; on logout, **clear** the whole query cache. Otherwise a stale logged-out or logged-in state redirects the wrong way.

## Student journey in the UI

```
Register / Google ─▶ /complete-profile ─▶ [pay application fee] ─▶ admission application
   ─▶ admin review (approved / rejected + reason) ─▶ pay admission invoice (bKash)
   ─▶ Student ID issued ─▶ enroll in sections ─▶ generate semester invoice
   ─▶ pay installments ─▶ download receipt
```

The student dashboard shows a single **next step** computed by the server (pay overdue, pay application fee, start application, under review, rejected, pay admission, no open semester, enroll, generate semester invoice, all set). Render it as the primary call to action; do not recompute it on the client.

### Gates the UI must explain (never show a raw error)

| Server response | What to show |
|---|---|
| `402` on application submit | Step 1: pay the application fee |
| `403` admission not confirmed | "Pay your admission fee" with a link to My fees |
| `403` `Overdue payment: installment N …` | Overdue card with amount, due date and **Pay now** |
| `409` | The specific message (already applied, invoice exists, and so on) |
| `studentIdCode == null` | "Pending admission confirmation", never an empty ID |

Overdue students are blocked from **enrolling, results and transcript only**. Paying, dropping, withdrawing, the dashboard, attendance, routine and the **ID card** keep working (the ID card is unlocked by paying its own ID card invoice). `isOverdueError()` in `src/lib/overdue.ts` detects the 403, and `<OverdueDuesBanner/>` shows the banner on the dashboard, My fees, enrollment, results and transcript pages.

## Money and payments

- Amounts are BDT numbers. Format with `Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" })`.
- **Never compute payable, outstanding or overdue values on the client.** Show what the API returns.
- The "Pay" amount is chosen by the server (next unpaid installment) unless the invoice allows partial payment.
- Installment status shown to users: `PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE` (overdue is derived by the server).
- Admin adjustments, waivers and cancellations always require a reason of at least 5 characters.
- The cancel form only appears on an invoice that is not cancelled and has `paidAmount = 0`. A paid invoice needs a refund first.

### bKash flow

1. `POST /payments/init` returns `{ transactionId, paymentID, bkashURL, amount }`. Save `payReturnTo` in `sessionStorage`, then `window.location.href = bkashURL`.
2. bKash sends the browser to `/payment/callback?paymentID=…&status=…`.
3. That page calls `GET /payments/bkash/callback` **once** (guard against the React strict-mode double run), shows success or failure, offers the receipt PDF, and continues to `payReturnTo`.
4. The callback is idempotent, so refreshing is safe. If a tab was closed mid-payment, the student can re-check with `POST /payments/:id/verify` from the payment history.

After any payment, verify, init or cancel mutation, invalidate: `["me"]`, the student dashboard, `["my-invoices"]`, `["my-summary"]`, `["my-payments"]` and the overdue query, so banners and blocks disappear without a refresh.

## Instructor area

- **Sections:** every section lists its lead instructor and co-instructors. All of them can take attendance, create exams and submit results for that section.
- **Admin section form:** pick the lead instructor, then optionally add co-instructors (up to 10). Saving an edit **replaces** the co-instructor list.
- **Dashboard:** assigned sections, pending actions (attendance to take, results to submit), upcoming exams and today's routine.

## Admin area

- **Fee policies** and **installment policies**: create, edit, activate. A fee policy only lets you change its name, amount, refundable flag, end date and active flag; make a new policy for anything else. Do not mark tuition as refundable.
- **Invoices:** list, detail, adjust, cancel, and **Bulk generate** (run after enrollment closes so every enrolled student has a semester invoice). The result dialog shows created, supplementary, skipped and failed counts.
- **Reports:** collection, outstanding, overdue. **Settings:** application fee required, admission payment required to enroll.
- Admission review queue: approve, or reject with a reason.

## Conventions

- One shared `ofetch` client with `credentials: "include"`. Errors come from `FetchError.data.message`; branch on `.status` (402, 403, 409).
- API envelope: `{ success, statusCode, message, data, meta? }`.
- One TanStack Query hook per resource. Every data page has loading, empty and error states.
- shadcn here is the Base UI variant: no `asChild`; use `render` or plain elements.
- Works at 375 px width and in dark mode. Use theme tokens, not hard-coded colors.
- PDFs (receipt, transcript, ID card) use `responseType: "blob"` and an object-URL download.

## Legal pages

`/terms` and `/privacy` are public and contain placeholders (`[University Name]`, support email, effective date, retention periods). Fill them in before launch.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Logged in, but `/login` still shows the form | The `me` query is stale or `retry` is on. Invalidate `me` after login, and set `retry: false` |
| After logout, `/login` bounces to the dashboard | The query cache was not cleared on logout |
| CORS error or cookie not sent | Server `FRONTEND_URL` must equal this origin exactly, and the cookie needs `SameSite=None; Secure` over HTTPS in production |
| bKash returns to a 404 | `BKASH_CALLBACK_URL` on the server must be this app's `/payment/callback` |
| Payment succeeds but the page shows no change | A mutation did not invalidate the money queries (see the list above) |
| Overdue banner never shows | The installment is not past `dueDate + graceDays`, or the student has no semester invoice |
| Raw 403 toast on enroll, results or transcript | The error handler is not calling `isOverdueError()` |

## Known limitations

- The `AdmissionGate` copy was written before the fee/approval rewrite and may be out of date.
- There is no realtime update; data refreshes on navigation and after mutations.
- English only.
- Instructors cannot view saved exam results (no read endpoint yet).

## License

ISC