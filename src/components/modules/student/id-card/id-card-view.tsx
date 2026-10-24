"use client";

import { CreditCard, Download, IdCard, UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getApiErrorMessage,
  useCreateIdCardInvoice,
  useDownloadIdCard,
  useGetMe,
  useIdCardStatus,
  useInitPayment,
} from "@/hooks";
import { formatBDT } from "@/lib/format";
import IdCardPreview from "./id-card-preview";

const RETURN_TO = "/student/id-card";

/**
 * Student ID card.
 *
 * The card is released once admission is confirmed AND the ID card fee is
 * settled (when the university charges for the card at all). The profile
 * fields printed on the card can always be updated — the fee only gates the
 * download, never the editing.
 */
export default function IdCardView() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const statusQuery = useIdCardStatus();
  const download = useDownloadIdCard();
  const createInvoice = useCreateIdCardInvoice();
  const initPayment = useInitPayment();

  const user = me?.data;
  const status = statusQuery.data?.data;
  const studentIdCode = status?.studentIdCode ?? null;
  const fee = status?.fee;
  const profile = status?.profile;

  const feeOutstanding = fee?.required === true && fee.status !== "PAID";
  const canDownload = status?.canDownload === true;

  /**
   * Pay the ID card fee:
   *  - NOT_INVOICED -> create the invoice first, then pay it
   *  - UNPAID        -> the invoice already exists, pay it
   */
  function handlePayFee() {
    if (!fee) return;

    const pay = (invoiceId: string) => {
      initPayment.mutate(
        { invoiceId },
        {
          onSuccess: (data) => {
            if (!data?.bkashURL) {
              toast.error("The payment gateway did not return a bKash URL.");
              return;
            }
            sessionStorage.setItem("payReturnTo", RETURN_TO);
            window.location.href = data.bkashURL;
          },
          onError: (err) =>
            toast.error(getApiErrorMessage(err, "Could not start payment.")),
        },
      );
    };

    if (fee.status === "UNPAID" && fee.invoiceId) {
      pay(fee.invoiceId);
      return;
    }

    createInvoice.mutate(undefined, {
      onSuccess: (invoice) => {
        if (!invoice?.id) {
          toast.error("Could not create the ID card invoice.");
          return;
        }
        pay(invoice.id);
      },
      onError: (err) =>
        toast.error(
          getApiErrorMessage(err, "Could not create the ID card invoice."),
        ),
    });
  }

  function handleDownload() {
    if (!studentIdCode) {
      toast.error("Student ID not issued yet", {
        description:
          "Confirm your admission first, then download your ID card.",
      });
      return;
    }
    download.mutate(studentIdCode, {
      onSuccess: () => toast.success("ID card downloaded."),
      onError: (err) => {
        const message = getApiErrorMessage(err, "Download failed.");
        const lower = message.toLowerCase();
        if (lower.includes("overdue")) {
          toast.error("You have overdue fees", {
            description:
              "Clear your overdue installment first, then download your ID card.",
          });
          return;
        }
        if (lower.includes("id card fee")) {
          toast.error("ID card fee pending", { description: message });
          return;
        }
        toast.error(message);
      },
    });
  }

  // 1. Loading state
  if (statusQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // 2. Error state
  if (statusQuery.isError || !status) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="ID Card"
          subtitle="Download your official student ID card as a PDF."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load your ID card</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            {getApiErrorMessage(statusQuery.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => statusQuery.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 3. No Student ID yet — empty state, not an error.
  if (!status.admissionConfirmed || !studentIdCode) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="ID Card"
          subtitle="Download your official student ID card as a PDF."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <IdCard className="size-5" />
          </span>
          <p className="text-sm font-semibold">Student ID not issued yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Your Student ID is issued when your admission is confirmed
            (application → approval → admission fee). Come back after that.
          </p>
        </div>
      </div>
    );
  }

  const paying = initPayment.isPending || createInvoice.isPending;

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="ID Card"
        subtitle="Download your official student ID card as a PDF."
      />

      {/* ID card fee - the university may charge for the physical card. */}
      {feeOutstanding ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-900">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-amber-900">
              ID card fee pending
            </p>
            <p className="mt-0.5 text-sm font-semibold text-amber-900">
              {fee?.status === "UNPAID"
                ? `${formatBDT(fee.amountDue)} is still due on invoice ${fee.invoiceNumber}.`
                : `Your ID card costs ${formatBDT(fee?.amountDue ?? 0)}. Pay it to download your card.`}
            </p>
          </div>
          <Button
            type="button"
            onClick={handlePayFee}
            disabled={paying}
            className="shrink-0 font-semibold"
          >
            {paying ? "Starting…" : "Pay ID card fee"}
          </Button>
        </div>
      ) : null}

      {/* Profile completeness — always editable, never blocked. */}
      {profile && !profile.complete ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/20 text-warning-foreground">
            <UserPen className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-foreground">
              Complete your profile for a complete card
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
              Missing: {profile.missing.join(", ")}.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-semibold"
              onClick={() => router.push("/student/profile-info")}
            >
              Update details
            </Button>
            {!profile.hasPhoto ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-semibold"
                onClick={() => router.push("/profile")}
              >
                Add photo
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <DashboardPanel title="Your card" subtitle="Check your details below.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <IdCard className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{user?.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
              <p className="mt-1 text-sm font-semibold">
                Student ID: {studentIdCode}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleDownload}
            disabled={download.isPending || !canDownload}
            className="mt-5 font-semibold"
          >
            <Download className="size-4" />
            {download.isPending
              ? "Downloading…"
              : canDownload
                ? "Download ID Card"
                : feeOutstanding
                  ? "Pay the ID card fee to download"
                  : "Download ID Card"}
          </Button>

          {fee?.required && fee.status === "PAID" ? (
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              ID card fee paid. Invoice {fee.invoiceNumber}.
            </p>
          ) : null}
        </DashboardPanel>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Preview
          </p>
          <IdCardPreview
            data={{
              studentName: user?.name ?? "-",
              studentIdCode,
              departmentName: status.departmentName ?? null,
              imageUrl: user?.imageUrl ?? null,
              session: studentIdCode ? sessionFromId(studentIdCode) : null,
              dateOfBirth: profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null,
              bloodGroup: profile?.bloodGroup ?? null,
              guardianName: profile?.guardianName ?? null,
              address: profile?.address ?? null,
              universityName:
                status.universityName ?? "University Management System",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** CSE-26-0002 -> 2026 — the admission session encoded in the student ID. */
function sessionFromId(studentIdCode: string): string | null {
  const match = /-(\d{2})-\d+$/.exec(studentIdCode);
  return match ? String(2000 + Number(match[1])) : null;
}
