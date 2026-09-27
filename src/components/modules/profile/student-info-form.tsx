"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { studentInfoSchema, type StudentInfoFormValues } from "@/app/validation";
import type { StudentProfileInfo, UpdateStudentProfilePayload } from "@/components/types";
import { getApiErrorMessage, useGetMe, useUpdateStudentProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FieldName = keyof StudentInfoFormValues;

const FIELDS: { name: FieldName; label: string; placeholder?: string; type?: string }[] = [
  { name: "phone", label: "Phone", placeholder: "017XXXXXXXX" },
  { name: "address", label: "Address", placeholder: "House, road, area, city" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "guardianName", label: "Guardian name", placeholder: "Full name of guardian" },
  { name: "guardianPhone", label: "Guardian phone", placeholder: "017XXXXXXXX" },
  { name: "bloodGroup", label: "Blood group", placeholder: "e.g. O+" },
];

function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function defaultsFrom(profile?: StudentProfileInfo | null): StudentInfoFormValues {
  return {
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    dateOfBirth: toDateInput(profile?.dateOfBirth),
    guardianName: profile?.guardianName ?? "",
    guardianPhone: profile?.guardianPhone ?? "",
    bloodGroup: profile?.bloodGroup ?? "",
  };
}

/** Empty strings become `undefined` so Prisma leaves existing values untouched. */
function toPayload(value: StudentInfoFormValues): UpdateStudentProfilePayload {
  const payload: UpdateStudentProfilePayload = {};
  (Object.keys(value) as FieldName[]).forEach((key) => {
    const v = value[key]?.trim();
    if (v) payload[key] = v;
  });
  return payload;
}

function StudentInfoFormInner({ initial }: { initial: StudentInfoFormValues }) {
  const { mutateAsync, isPending } = useUpdateStudentProfile();

  const form = useForm({
    defaultValues: initial,
    validators: { onSubmit: studentInfoSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(toPayload(value));
        toast.success("Student info saved", {
          description: "Your extra information is up to date.",
        });
      } catch (error) {
        toast.error("Could not save", {
          description: getApiErrorMessage(error, "Something went wrong, try again."),
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <form.Field
              key={f.name}
              name={f.name}
              children={(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      {f.label}{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={f.type ?? "text"}
                      placeholder={f.placeholder}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        "h-11",
                        hasError &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                      )}
                    />
                    {hasError && (
                      <div className="flex flex-col gap-1.5">
                        {field.state.meta.errors.map((error, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-xs font-medium text-destructive"
                          >
                            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                            <span>{error?.message ?? "Invalid value"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Field>
                );
              }}
            />
          ))}
        </div>
        <Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto sm:px-8"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            )}
          />
        </Field>
      </FieldGroup>
    </form>
  );
}

export default function StudentInfoForm() {
  const { data, isPending, isError, refetch, isRefetching } = useGetMe();
  const profile = data?.data?.studentProfile ?? null;

  if (isPending) {
    return (
      <DashboardPanel title="Student info" subtitle="Loading your information…">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      </DashboardPanel>
    );
  }

  if (isError) {
    return (
      <DashboardPanel title="Student info" subtitle="We couldn't load your information.">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-semibold">Could not load student info</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {isRefetching ? "Retrying…" : "Retry"}
          </button>
        </div>
      </DashboardPanel>
    );
  }

  if (!profile) {
    return (
      <DashboardPanel title="Student info" subtitle="No student profile found.">
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-semibold">No student profile yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
            Complete your student profile first, then you can add extra information here.
          </p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title="Student info"
      subtitle="All fields are optional — fill in whatever you want to share."
    >
      <FieldDescription className="mb-4">
        Student ID <span className="font-semibold text-foreground">{profile.studentIdCode}</span>
      </FieldDescription>
      <StudentInfoFormInner initial={defaultsFrom(profile)} />
    </DashboardPanel>
  );
}
