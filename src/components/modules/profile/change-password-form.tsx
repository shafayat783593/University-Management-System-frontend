"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { changePasswordSchema } from "@/app/validation";
import { getApiErrorMessage, useChangePassword } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChangePasswordValue } from "@/components/types";



function PasswordField({
  form,
  name,
  label,
  placeholder,
}: {
  form: any;
  name: "oldPassword" | "newPassword" | "confirmPassword";
  label: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <form.Field
      name={name}
      children={(field: {
        name: string;
        state: { value: string; meta: { errors: { message?: string }[] } };
        handleBlur: () => void;
        handleChange: (v: string) => void;
      }) => {
        const hasError = field.state.meta.errors.length > 0;
        return (
          <Field className="gap-2">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={field.name}
                name={field.name}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(
                  "h-11 pl-10 pr-11",
                  hasError &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                )}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? `Hide ${label}` : `Show ${label}`}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
  );
}

export default function ChangePasswordForm() {
  const { mutateAsync, isPending } = useChangePassword();

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as ChangePasswordValue,
    
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({
          oldPassword: value.oldPassword,
          newPassword: value.newPassword,
        });
        toast.success("Password changed", {
          description: "Use your new password next time you sign in.",
        });
        form.reset();
      } catch (error) {
        toast.error("Could not change password", {
          description: getApiErrorMessage(error, "Check your current password and try again."),
        });
      }
    },
  });

  return (
    <DashboardPanel
      title="Change password"
      subtitle="Must be at least 8 characters with upper, lower, number and symbol."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <PasswordField
            form={form}
            name="oldPassword"
            label="Current password"
            placeholder="Enter your current password"
          />
          <PasswordField
            form={form}
            name="newPassword"
            label="New password"
            placeholder="Enter a new password"
          />
          <PasswordField
            form={form}
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Repeat the new password"
          />
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
                      <Spinner /> Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              )}
            />
          </Field>
        </FieldGroup>
      </form>
    </DashboardPanel>
  );
}
