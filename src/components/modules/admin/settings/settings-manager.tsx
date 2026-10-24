"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiClient";
import { useSettings, useUpdateSettings } from "@/hooks";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border bg-card p-4 text-left"
    >
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-0.5 block text-[13px] text-muted-foreground">
          {hint}
        </span>
      </span>
      <span
        className={cn(
          "mt-1 grid h-6 w-11 shrink-0 place-items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "block size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-2.5" : "-translate-x-2.5",
          )}
        />
      </span>
    </button>
  );
}

// §4 — PATCH /settings (ADMIN). At least one flag per save.
export default function SettingsManager() {
  const settingsQuery = useSettings();
  const update = useUpdateSettings();

  const remote = settingsQuery.data;
  const [applicationFeeRequired, setApplicationFeeRequired] = useState(false);
  const [admissionPaymentRequiredToEnroll, setAdmissionPaymentRequiredToEnroll] =
    useState(false);
  const [universityName, setUniversityName] = useState("");
  const [idCardValidityYears, setIdCardValidityYears] = useState(1);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (remote) {
      setApplicationFeeRequired(remote.applicationFeeRequired);
      setAdmissionPaymentRequiredToEnroll(remote.admissionPaymentRequiredToEnroll);
      setUniversityName(remote.universityName ?? "");
      setIdCardValidityYears(remote.idCardValidityYears ?? 1);
      setDirty(false);
    }
  }, [remote]);

  function handleSave() {
    update.mutate(
      {
        applicationFeeRequired,
        admissionPaymentRequiredToEnroll,
        universityName: universityName.trim() || undefined,
        idCardValidityYears,
      },
      {
        onSuccess: () => {
          setDirty(false);
          toast.success("Settings updated.");
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Could not save settings.")),
      },
    );
  }

  if (settingsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (settingsQuery.isError || !remote) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="Settings"
          subtitle="Admission and fee gates for the whole university."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load settings</p>
          <p className="text-[13px] text-muted-foreground">
            {getApiErrorMessage(settingsQuery.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => settingsQuery.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Settings"
        subtitle="Admission and fee gates for the whole university."
        action={
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || update.isPending}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <DashboardPanel
        title="Admission gates"
        subtitle="These flags drive the student application form and enrollment."
      >
        <div className="flex flex-col gap-3">
          <Toggle
            checked={applicationFeeRequired}
            onChange={(v) => {
              setApplicationFeeRequired(v);
              setDirty(true);
            }}
            label="Application fee required"
            hint="On: students must pay the application fee before submitting (POST returns 402 until paid)."
          />
          <Toggle
            checked={admissionPaymentRequiredToEnroll}
            onChange={(v) => {
              setAdmissionPaymentRequiredToEnroll(v);
              setDirty(true);
            }}
            label="Admission payment required to enroll"
            hint="On: students confirm admission by paying before they can enroll (403 until confirmed)."
          />
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="ID card"
        subtitle="Branding and validity printed on every student ID card."
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">University name</span>
            <input
              type="text"
              value={universityName}
              onChange={(e) => {
                setUniversityName(e.target.value);
                setDirty(true);
              }}
              placeholder="University Management System"
              className="h-10 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <span className="text-[13px] text-muted-foreground">
              Printed in the header of the card and on the email.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">Card validity (years)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={idCardValidityYears}
              onChange={(e) => {
                const n = Number(e.target.value);
                setIdCardValidityYears(
                  Number.isFinite(n) ? Math.min(Math.max(n, 1), 10) : 1,
                );
                setDirty(true);
              }}
              className="h-10 w-28 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <span className="text-[13px] text-muted-foreground">
              The &quot;valid until&quot; date printed on the card.
            </span>
          </label>
        </div>
      </DashboardPanel>
    </div>
  );
}
