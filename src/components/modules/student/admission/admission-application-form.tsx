"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FetchError } from "ofetch";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AdmissionApplicationPayload } from "@/api";
import {
  type AdmissionApplicationFormValues,
  admissionApplicationSchema,
} from "@/app/validation/admission.validation";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateApplicationInvoice,
  useMyAdmissionApplication,
  useSubmitAdmissionApplication,
  useUpdateAdmissionApplication,
} from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { formatBDT } from "@/lib/format";
import { redirectToBkash } from "@/lib/payment";

function TextField({
  label,
  required,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-semibold">
        {label}
        {required ? (
          <span className="text-destructive"> *</span>
        ) : (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
      </span>
      <Input {...inputProps} className="h-11" />
      {error ? (
        <span className="text-xs font-medium text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

function toPayload(
  values: AdmissionApplicationFormValues,
): AdmissionApplicationPayload {
  const text = (v?: string) => (v?.trim() ? v.trim() : undefined);
  const num = (v?: string) => {
    if (!v?.trim()) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    previousInstitution: values.previousInstitution.trim(),
    sscBoard: text(values.sscBoard),
    sscYear: num(values.sscYear),
    sscGpa: num(values.sscGpa),
    hscBoard: text(values.hscBoard),
    hscYear: num(values.hscYear),
    hscGpa: num(values.hscGpa),
    guardianOccupation: text(values.guardianOccupation),
    presentAddress: text(values.presentAddress),
    permanentAddress: text(values.permanentAddress),
  };
}

// Task 13 — 2 steps: pay application fee → fill form. Then review states.
export default function AdmissionApplicationForm() {
  const router = useRouter();
  const existingQuery = useMyAdmissionApplication();
  const mine = existingQuery.data ?? null;
  const existing = mine?.application ?? null;
  const fee = mine?.applicationFee ?? {
    required: false,
    amount: 0,
    isPaid: false,
  };

  const submit = useSubmitAdmissionApplication();
  const update = useUpdateAdmissionApplication();
  const createInvoice = useCreateApplicationInvoice();
  const [paying, setPaying] = useState(false);
  const busy = submit.isPending || update.isPending;

  const form = useForm<AdmissionApplicationFormValues>({
    resolver: zodResolver(admissionApplicationSchema),
    defaultValues: {
      previousInstitution: "",
      sscBoard: "",
      hscBoard: "",
      guardianOccupation: "",
      presentAddress: "",
      permanentAddress: "",
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        previousInstitution: existing.previousInstitution ?? "",
        sscBoard: existing.sscBoard ?? "",
        sscYear: existing.sscYear != null ? String(existing.sscYear) : "",
        sscGpa: existing.sscGpa != null ? String(existing.sscGpa) : "",
        hscBoard: existing.hscBoard ?? "",
        hscYear: existing.hscYear != null ? String(existing.hscYear) : "",
        hscGpa: existing.hscGpa != null ? String(existing.hscGpa) : "",
        guardianOccupation: existing.guardianOccupation ?? "",
        presentAddress: existing.presentAddress ?? "",
        permanentAddress: existing.permanentAddress ?? "",
      });
    }
  }, [existing, form]);

  async function handlePayFee() {
    setPaying(true);
    try {
      const invoice = await createInvoice.mutateAsync();
      if (!invoice) throw new Error("Could not create fee invoice.");
      await redirectToBkash(invoice.id, "/student/admission-application");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start payment."));
      setPaying(false);
    }
  }

  // Task 13.4 — pay the ADMISSION invoice from here, without a detour to
  // "my fees" (which lists invoices the student may not recognise).
  async function handlePayAdmissionFee() {
    const invoice = mine?.admissionInvoice;
    if (!invoice) return;
    setPaying(true);
    try {
      await redirectToBkash(invoice.id, "/student/admission-application");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start payment."));
      setPaying(false);
    }
  }

  async function onSubmit(values: AdmissionApplicationFormValues) {
    try {
      if (existing) {
        await update.mutateAsync(toPayload(values));
        toast.success("Application updated.");
      } else {
        await submit.mutateAsync(toPayload(values));
        toast.success("Application submitted — the university will review it.");
      }
      router.push("/student/admission-application");
    } catch (error) {
      if (error instanceof FetchError && error.status === 402) {
        toast.error("Pay the application fee first", {
          description: "Complete Step 1 below, then submit the form.",
        });
        void existingQuery.refetch();
        return;
      }
      if (error instanceof FetchError && error.status === 409) {
        toast.error("Already submitted", {
          description: getApiErrorMessage(
            error,
            "Admission application already submitted.",
          ),
        });
        return;
      }
      toast.error(
        getApiErrorMessage(error, "Could not save your application."),
      );
    }
  }

  if (existingQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (existingQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-semibold">
          Could not check your application
        </p>
        <button
          type="button"
          onClick={() => existingQuery.refetch()}
          className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  // Step 1 — application fee unpaid (no TrxID field, ever).
  if (fee.required && !fee.isPaid) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Admission application — Step 1 of 2"
          subtitle="Pay the application fee to unlock the form."
        />
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-sm">
            Application fee: <strong>{formatBDT(fee.amount)}</strong>
          </p>
          <p className="text-[13px] text-muted-foreground">
            Pay with bKash. You will return here automatically, then fill the
            form.
          </p>
          <Button
            type="button"
            disabled={paying || createInvoice.isPending}
            onClick={handlePayFee}
            className="h-11 sm:w-fit sm:px-8"
          >
            {paying
              ? "Starting payment…"
              : `Pay ${formatBDT(fee.amount)} with bKash`}
          </Button>
        </div>
      </div>
    );
  }

  // APPROVED — the ADMISSION invoice is the only thing between the student and
  // a Student ID. Show the exact server amounts and pay from right here.
  if (existing && existing.status === "APPROVED") {
    const admissionInvoice = mine?.admissionInvoice ?? null;
    const admissionDue = admissionInvoice?.outstandingBalance ?? 0;

    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Admission application"
          subtitle="Status: approved"
        />

        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6">
          <p>
            <Badge variant="success">APPROVED</Badge>
          </p>

          {mine?.admissionConfirmed ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-success">
                Admission confirmed
                {mine?.studentIdCode
                  ? ` — Student ID ${mine.studentIdCode}`
                  : ""}
                . You can enroll now.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/student/enrollments"
                  className="inline-flex h-9 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Browse sections
                </Link>
                <Link
                  href="/student/payments/my-fees"
                  className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
                >
                  View my fees
                </Link>
              </div>
            </div>
          ) : admissionInvoice ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Your application is approved. Pay the admission fee to confirm
                admission and receive your Student ID.
              </p>

              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/60 p-3">
                  <dt className="text-[11px] text-muted-foreground">Payable</dt>
                  <dd className="mt-0.5 font-bold tabular-nums">
                    {formatBDT(admissionInvoice.payableAmount)}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <dt className="text-[11px] text-muted-foreground">Paid</dt>
                  <dd className="mt-0.5 font-bold tabular-nums text-success">
                    {formatBDT(admissionInvoice.paidAmount)}
                  </dd>
                </div>
                <div className="rounded-xl bg-destructive/[0.07] p-3">
                  <dt className="text-[11px] text-muted-foreground">Due</dt>
                  <dd className="mt-0.5 font-bold tabular-nums text-destructive">
                    {formatBDT(admissionDue)}
                  </dd>
                </div>
              </dl>

              {admissionInvoice.status === "PAID" ? (
                <p className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-[13px] font-medium">
                  The admission invoice is marked as paid, but admission is not
                  confirmed yet. Re-check the payment from{" "}
                  <Link href="/student/payments" className="underline">
                    payment history
                  </Link>{" "}
                  or contact the accounts office.
                </p>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={paying}
                    onClick={handlePayAdmissionFee}
                    className="h-11 sm:w-fit sm:px-8"
                  >
                    {paying
                      ? "Starting payment…"
                      : `Pay ${formatBDT(admissionDue)} with bKash`}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Invoice{" "}
                    {admissionInvoice.invoiceNumber ?? admissionInvoice.id}.{" "}
                    <Link
                      href={`/student/invoices/${admissionInvoice.id}`}
                      className="underline"
                    >
                      View details
                    </Link>{" "}
                    ·{" "}
                    <Link
                      href="/student/payments/my-fees"
                      className="underline"
                    >
                      All my fees
                    </Link>
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                Your application is approved, but no admission fee is currently
                charged. Contact the accounts office if you expected an invoice
                — you cannot enroll or generate a semester invoice until the
                office confirms admission.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/student/payments/my-fees"
                  className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
                >
                  All my fees
                </Link>
                <button
                  type="button"
                  onClick={() => void existingQuery.refetch()}
                  className="inline-flex h-9 items-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
                >
                  Refresh status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // REJECTED — show reason, allow editing and resubmitting.
  if (existing && existing.status === "REJECTED") {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Admission application"
          subtitle="Status: rejected — fix and resubmit"
        />
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px]">
          <span className="font-semibold">Rejection reason: </span>
          {existing.rejectionReason ??
            "No reason given. Contact the admissions office."}
        </p>
        <ApplicationForm
          form={form}
          busy={busy}
          feePaid={fee.isPaid}
          isEdit
          onSubmit={onSubmit}
        />
      </div>
    );
  }

  // SUBMITTED — pre-filled, save via PATCH.
  // No application yet — Step 2 form.
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={
          existing
            ? "Admission application"
            : "Admission application — Step 2 of 2"
        }
        subtitle={
          existing
            ? "Your application is submitted — edit it below if anything changed."
            : "Fill this once. The university reviews it, then invoices your admission fee."
        }
      />
      {fee.isPaid && !existing ? (
        <p className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] font-medium text-success">
          Application fee paid — now submit the form below.
        </p>
      ) : null}
      <ApplicationForm
        form={form}
        busy={busy}
        feePaid={fee.isPaid}
        isEdit={Boolean(existing)}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function ApplicationForm({
  form,
  busy,
  isEdit,
  onSubmit,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  busy: boolean;
  feePaid: boolean;
  isEdit: boolean;
  onSubmit: (v: AdmissionApplicationFormValues) => void;
}) {
  const { register, handleSubmit, formState } = form;
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <TextField
        label="Previous institution"
        required
        placeholder="Dhaka College"
        error={formState.errors.previousInstitution?.message}
        {...register("previousInstitution")}
      />
      <fieldset className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-3">
        <legend className="px-2 text-sm font-bold">SSC</legend>
        <TextField
          label="Board"
          placeholder="Dhaka"
          error={formState.errors.sscBoard?.message}
          {...register("sscBoard")}
        />
        <TextField
          label="Year"
          type="number"
          placeholder="2022"
          error={formState.errors.sscYear?.message}
          {...register("sscYear")}
        />
        <TextField
          label="GPA (0–5)"
          type="number"
          step="0.01"
          placeholder="5.00"
          error={formState.errors.sscGpa?.message}
          {...register("sscGpa")}
        />
      </fieldset>
      <fieldset className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-3">
        <legend className="px-2 text-sm font-bold">HSC</legend>
        <TextField
          label="Board"
          placeholder="Dhaka"
          error={formState.errors.hscBoard?.message}
          {...register("hscBoard")}
        />
        <TextField
          label="Year"
          type="number"
          placeholder="2024"
          error={formState.errors.hscYear?.message}
          {...register("hscYear")}
        />
        <TextField
          label="GPA (0–5)"
          type="number"
          step="0.01"
          placeholder="5.00"
          error={formState.errors.hscGpa?.message}
          {...register("hscGpa")}
        />
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Guardian occupation"
          placeholder="Teacher"
          error={formState.errors.guardianOccupation?.message}
          {...register("guardianOccupation")}
        />
        <TextField
          label="Present address"
          placeholder="House, road, area, city"
          error={formState.errors.presentAddress?.message}
          {...register("presentAddress")}
        />
      </div>
      <TextField
        label="Permanent address"
        placeholder="Village, upazila, district"
        error={formState.errors.permanentAddress?.message}
        {...register("permanentAddress")}
      />
      <Button type="submit" disabled={busy} className="h-11 sm:w-fit sm:px-8">
        {busy ? "Saving…" : isEdit ? "Save changes" : "Submit application"}
      </Button>
    </form>
  );
}
