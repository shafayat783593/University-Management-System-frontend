"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { FetchError } from "ofetch";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import AuthLoading from "@/components/auth/auth.loading";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  completeProfileSchema,
  type CompleteProfileFormValues,
} from "@/app/validation";
import {
  getApiErrorMessage,
  useCompleteProfile,
  useGetMe,
  useGetAllDepartment,
} from "@/hooks";

/* eslint-disable @typescript-eslint/no-explicit-any */

// §3: POST /auth/complete-profile — Google sign-ups only pick a department
// (+optional phone). Academic background is submitted separately via
// /student/admission-application. One-time: a second call returns 409.
const DEFAULTS: CompleteProfileFormValues = {
  departmentId: "",
  phone: "",
};

function TextField({
  form,
  name,
  label,
  placeholder,
  type,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => {
        const isInvalid =
          field.state.meta.isTouched && field.state.meta.errors.length > 0;
        return (
          <Field data-invalid={isInvalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type={type ?? "text"}
              placeholder={placeholder}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              aria-invalid={isInvalid}
              className={cn(
                "h-11",
                isInvalid &&
                  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              )}
            />
            <FieldError errors={isInvalid ? field.state.meta.errors : []} />
          </Field>
        );
      }}
    </form.Field>
  );
}

export default function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDept = searchParams.get("departmentId") ?? "";

  const { data: meData, isPending: mePending } = useGetMe();
  const user = meData?.data;
  const complete = useCompleteProfile();
  const { data: departments, isLoading: deptsLoading } = useGetAllDepartment();

  const form = useForm({
    defaultValues: { ...DEFAULTS, departmentId: preselectedDept },
    validators: { onChange: completeProfileSchema },
    onSubmit: async ({ value }) => {
      try {
        await complete.mutateAsync({
          departmentId: value.departmentId,
          phone: value.phone?.trim() ? value.phone.trim() : undefined,
        });
        toast.success("Profile completed", {
          description: "Now submit your admission application.",
        });
        router.replace("/student/admission-application");
      } catch (error) {
        if (error instanceof FetchError && error.status === 409) {
          toast.info("Profile already completed", {
            description: "Redirecting to admission application…",
          });
          router.replace("/student/admission-application");
        } else {
          toast.error(getApiErrorMessage(error, "Could not complete your profile"));
        }
      }
    },
  });

  // Prefill department from ?departmentId= (Task 6A CTA).
  useEffect(() => {
    if (preselectedDept) form.setFieldValue("departmentId", preselectedDept);
  }, [preselectedDept, form]);

  // Profile already completed → complete-profile is one-time (second call = 409).
  useEffect(() => {
    if (!mePending && user?.role === "STUDENT" && user.studentProfile) {
      router.replace("/student/admission-application");
    }
  }, [mePending, user, router]);

  if (mePending) return <AuthLoading label="Loading…" />;
  if (user?.role === "STUDENT" && user.studentProfile) {
    return <AuthLoading label="Redirecting…" />;
  }
  if (user && user.role !== "STUDENT") {
    router.replace("/profile");
    return <AuthLoading label="Redirecting…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Complete your profile"
        subtitle="Pick your department to finish setting up your account, then submit your admission application."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-6 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Department */}
            <form.Field name="departmentId">
              {(field: any) => {
                const isInvalid =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor="apply-dept">Department</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v: string | null) => field.handleChange(v ?? "")}
                      disabled={deptsLoading}
                    >
                      <SelectTrigger id="apply-dept" className="h-11 w-full">
                        <SelectValue
                          placeholder={deptsLoading ? "Loading…" : "Select a department"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(departments ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                  </Field>
                );
              }}
            </form.Field>

            <TextField form={form} name="phone" label="Phone (optional)" placeholder="01XXXXXXXXX" />
          </div>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="h-11 sm:w-fit sm:px-8"
                disabled={!canSubmit || isSubmitting || complete.isPending}
              >
                {isSubmitting || complete.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Complete profile"
                )}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </div>
  );
}
