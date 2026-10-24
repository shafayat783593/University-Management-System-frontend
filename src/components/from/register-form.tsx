"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  type StudentRegisterFormValues,
  StudentRegisterSchema,
} from "@/app/validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllDepartment, useRegistration } from "@/hooks";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegistration();
  const { data: departments, isLoading: deptsLoading } = useGetAllDepartment();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: "",
      phone: "",
    } as StudentRegisterFormValues,
    validators: {
      onChange: StudentRegisterSchema,
    },
    onSubmit: async ({ value }) => {
      registerMutation.mutate(
        {
          name: value.name,
          email: value.email,
          password: value.password,
          departmentId: value.departmentId,
          phone: value.phone?.trim() ? value.phone.trim() : undefined,
        },
        {
        onSuccess: (response) => {
          if (!response.success) {
            toast.error("Registration failed", { description: response.message || "Registration failed. Please try again." });
            return;
          }

          toast.success("Registration successful", { description: "Check your email for the verification code" });
          router.push(`/account-verify?email=${encodeURIComponent(value.email)}&mode=student`);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Registration failed";
          toast.error("Registration failed", { description: message });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          Create your student account
        </h1>
        <p className="text-sm text-muted-foreground">
          Register with your basic details — you'll submit your admission
          application after verifying your email and logging in.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* Name */}
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Karim Hasan"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="name"
                      className={cn(
                        "h-11 pl-10",
                        isInvalid &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                  </div>
                  <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                </Field>
              );
            }}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@university.edu"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      className={cn(
                        "h-11 pl-10",
                        isInvalid &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                  </div>
                  <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                </Field>
              );
            }}
          </form.Field>

          {/* Password */}
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      className={cn(
                        "h-11 pl-10",
                        isInvalid &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                  </div>
                  <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                </Field>
              );
            }}
          </form.Field>

          {/* Department (§3: required at register) */}
          <form.Field name="departmentId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(v: string | null) => field.handleChange(v ?? "")}
                    disabled={deptsLoading}
                  >
                    <SelectTrigger id={field.name} className="h-11 w-full">
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

          {/* Phone (optional) */}
          <form.Field name="phone">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="tel"
                    className={cn(
                      "h-11",
                      isInvalid &&
                        "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                </Field>
              );
            }}
          </form.Field>

          {/* Submit */}
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="h-11 w-full text-[15px]"
                disabled={!canSubmit || registerMutation.isPending || isSubmitting}
              >
                {registerMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending code…
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
