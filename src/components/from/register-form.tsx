"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, User, Mail, Lock, Hash, Phone } from "lucide-react";
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
import { useRegistration } from "@/hooks";
import { useGetAllDepartment } from "../../hooks/departments.hook";
import { toast } from "../ui/toast";

export default function RegisterForm() {
  const router = useRouter();
  const { data: departments, isLoading: departmentsLoading } =
    useGetAllDepartment();
  const registerMutation = useRegistration();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: "",
      studentIdCode: "",
      phone: "",
    } as StudentRegisterFormValues,
    validators: {
      onChange: StudentRegisterSchema,
    },
    onSubmit: async ({ value }) => {
      registerMutation.mutate(value, {
        onSuccess: (response) => {
          if (!response.success) {
            toast.add({
              title: "Registration failed",
              description:
                response.message || "Registration failed. Please try again.",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Registration successful",
            description: "Check your email for the verification code",
            type: "success",
          });
          router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Registration failed";
          toast.add({
            title: "Registration failed",
            description: message,
            type: "error",
          });
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
          Register with your details to start your application.
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

          {/* Department */}
          <form.Field name="departmentId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                    disabled={departmentsLoading}
                  >
                    <SelectTrigger id={field.name} className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          departmentsLoading ? "Loading…" : "Select a department"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departments) && departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {departmentsLoading ? "Loading…" : "No departments found"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError errors={isInvalid ? field.state.meta.errors : []} />
                </Field>
              );
            }}
          </form.Field>

          {/* Student ID + Phone side by side on larger widths */}
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="studentIdCode">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Student ID</FieldLabel>
                    <div className="relative">
                      <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="CSE-2027-001"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
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

            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="tel"
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
          </div>

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