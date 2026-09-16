"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/app/validation";
import { useLogin } from "@/hooks";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

type LoginFormData = {
  email: string;
  password: string;
};

export function LoginForm({ className, ...props }: ComponentProps<"form">) {
  const { mutateAsync: login, isPending: loginPending } = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "shafayat783@gmail.com",
      password: "12345678Un@",
    } as LoginFormData,

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        await login({
          email: value.email,
          password: value.password,
        });

        toast.add({
          title: "Login successful",
          description: "You have been logged in successfully.",
          type: "success",
        });

        router.push("/");
      } catch (error) {
        toast.add({
          title: "Login failed",
          description: "Invalid email or password.",
          type: "error",
        });
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
        {...props}
      >
        <FieldGroup>
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your university credentials to continue.
            </p>
          </div>

          {/* Email */}
          <form.Field
            name="email"
            children={(field) => {
              const hasError = field.state.meta.errors.length > 0;

              return (
                <Field className="gap-2">
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
                      className={cn(
                        "h-11 pl-10 transition-colors",
                        hasError &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                  </div>

                  {hasError && (
                    <div className="flex flex-col gap-1.5">
                      {field.state.meta.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
                        >
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                          <span>{error?.message ?? "Invalid email"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              );
            }}
          />

          {/* Password */}
          <form.Field
            name="password"
            children={(field) => {
              const hasError = field.state.meta.errors.length > 0;

              return (
                <Field className="gap-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        "h-11 pl-10 pr-11 transition-colors",
                        hasError &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {hasError ? (
                    <div className="flex flex-col gap-1.5">
                      {field.state.meta.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
                        >
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                          <span>{error?.message ?? "Invalid password"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FieldDescription>Must be at least 8 characters.</FieldDescription>
                  )}
                </Field>
              );
            }}
          />

          {/* Submit */}
          <Field>
            <Button type="submit" className="h-11 w-full text-[15px]" disabled={loginPending}>
              {loginPending ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <GoogleLoginComponent />

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <a href="/register" className="font-medium text-primary hover:underline">
          Apply for admission
        </a>
      </p>
    </div>
  );
}