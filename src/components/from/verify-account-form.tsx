"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useVerifyAccount, useVerifyInstructorEmailVerify } from "@/hooks";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const RESEND_COOLDOWN = 120;

export default function VerifyAccountForm({
  mode,
}: {
  mode: "instructor" | "student";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const { mutate: verifyInstructor } = useVerifyInstructorEmailVerify();
  const { mutate: verifyStudent } = useVerifyAccount();

  const verify = mode === "instructor" ? verifyInstructor : verifyStudent;

  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOTP = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verify(
      { email, otp },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.error("Server error", {
              description: "Something went wrong. Please try again.",
            });
            return;
          }

          if (mode === "instructor") {
            toast.success("Verification submitted", {
              description:
                "An admin will approve your account. This may take some time — please check your email in a few hours.",
            });
          } else {
            toast.success("Welcome onboard", {
              description: "Your account has been verified successfully.",
            });
          }
          router.push("/");
        },
        onError: (err) => {
          setIsInvalid(true);
          toast.error("Verification failed", {
            description:
              err.message || "Something went wrong. Please try again.",
          });
        },
      },
    );
  };

  if (!email) {
    return null;
  }

  const minutes = Math.floor(resendTimer / 60);
  const seconds = resendTimer % 60;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to{" "}
          {mode === "instructor"
            ? "activate your instructor account"
            : "finish setting up your account"}
          .
        </p>
      </div>

      <Card className="border-border/60 shadow-soft">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-base">Enter verification code</CardTitle>
          <CardDescription>
            The code expires shortly. Do not share it with anyone.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="otp-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOTP();
            }}
          >
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  onChange={(value) => {
                    setOtp(value);
                    if (isInvalid) {
                      setIsInvalid(false);
                    }
                  }}
                  value={otp}
                  autoComplete="one-time-code"
                  name="otp"
                  id="otp"
                  pattern={REGEXP_ONLY_DIGITS}
                  containerClassName="justify-center"
                  aria-invalid={isInvalid}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                    <InputOTPSlot
                      index={1}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                    <InputOTPSlot
                      index={2}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                    <InputOTPSlot
                      index={3}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                    <InputOTPSlot
                      index={4}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                    <InputOTPSlot
                      index={5}
                      className="size-12 text-base font-medium sm:size-14"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {isInvalid && (
                <FieldError
                  errors={[
                    {
                      message:
                        "That code doesn't look right. Please try again.",
                    },
                  ]}
                />
              )}

              <FieldDescription className="text-center">
                {resendTimer > 0
                  ? `You can request a new code in ${minutes}:${seconds
                      .toString()
                      .padStart(2, "0")}.`
                  : "Didn't receive it? Check your spam folder or request a new code."}
              </FieldDescription>
            </Field>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? "Resend code" : "Resend code"}
          </Button>
          <Button
            type="submit"
            form="otp-form"
            className="w-full sm:w-auto sm:min-w-32"
          >
            Verify account
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Wrong email address?{" "}
        <a
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Go back and register again
        </a>
        .
      </p>
    </div>
  );
}
