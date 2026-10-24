"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FetchError } from "ofetch";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type BkashCallbackResult, bkashCallback, verifyPayment } from "@/api";
import {
  useDownloadTransactionReceipt,
  useVerifyPayment,
} from "@/hooks/payments.hook";
import { getApiErrorMessage } from "@/lib/apiClient";

const RETURN_KEY = "payReturnTo";
const DEFAULT_RETURN_TO = "/student/payments/my-fees";

function takeReturnTo(): string {
  try {
    const stored = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    // Only ever follow same-origin, absolute paths.
    if (stored?.startsWith("/") && !stored.startsWith("//")) return stored;
    return DEFAULT_RETURN_TO;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

function CallbackBody() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const paymentID = params.get("paymentID") ?? "";
  const status = params.get("status") ?? "";
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; result: BkashCallbackResult }
    | { kind: "fail"; message: string }
  >({ kind: "idle" });
  const [verifying, setVerifying] = useState(false);
  const [returnTo, setReturnTo] = useState(DEFAULT_RETURN_TO);
  const downloadReceipt = useDownloadTransactionReceipt();
  const verifyMutation = useVerifyPayment();
  // StrictMode mounts effects twice — the callback must hit the server once.
  const calledRef = useRef(false);

  // Money + admission state all changed because of this payment.
  function refreshMoneyState() {
    void queryClient.invalidateQueries({ queryKey: ["me"] });
    void queryClient.invalidateQueries({ queryKey: ["admission-application"] });
    void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  }

  useEffect(() => {
    setReturnTo(takeReturnTo());
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per paymentID/status, guarded by calledRef
  useEffect(() => {
    if (!paymentID || !status) return;
    if (calledRef.current) return;
    calledRef.current = true;

    let alive = true;
    setState({ kind: "loading" });
    bkashCallback(paymentID, status)
      .then((result) => {
        if (!alive) return;
        setState({ kind: "ok", result });
        if (result.success) refreshMoneyState();
      })
      .catch((err) => {
        if (!alive) return;
        // bKash "failure/cancel" comes back as success:false envelope (400),
        // still show the server message instead of a generic error.
        const data = (err as FetchError)?.data as
          | { message?: string; data?: BkashCallbackResult }
          | undefined;
        const nested = data?.data;
        if (nested && typeof nested.success === "boolean") {
          setState({ kind: "ok", result: nested });
          if (nested.success) refreshMoneyState();
        } else {
          setState({
            kind: "fail",
            message: getApiErrorMessage(err, "Payment could not be verified"),
          });
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentID, status]);

  async function handleVerify() {
    const txId = state.kind === "ok" ? state.result.transactionId : undefined;
    if (!txId) {
      toast.error("Nothing to verify yet.");
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyPayment(txId);
      setState({ kind: "ok", result });
      refreshMoneyState();
      if (result.success) {
        toast.success("Payment successful.");
      } else {
        toast.error(result.message || "Payment is still not completed.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Verification failed."));
    } finally {
      setVerifying(false);
    }
  }

  const txId = state.kind === "ok" ? state.result.transactionId : undefined;

  function handleDownloadReceipt() {
    if (!txId) return;
    downloadReceipt.mutate(
      { id: txId, filename: `receipt-${txId}.pdf` },
      {
        onSuccess: () => toast.success("Receipt downloaded."),
        onError: (err) =>
          toast.error(
            getApiErrorMessage(err, "Could not download the receipt."),
          ),
      },
    );
  }

  // Missing query params — empty state (page must be safe to refresh/share).
  if (!paymentID || !status) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3 rounded-2xl border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">Payment callback</h1>
        <p className="text-sm text-muted-foreground">
          Missing paymentID or status. If you just paid with bKash, go back to
          your fees and try again.
        </p>
        <Link
          href={DEFAULT_RETURN_TO}
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Back to my fees
        </Link>
      </div>
    );
  }

  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">Confirming payment…</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Asking the server to verify with bKash. Safe to refresh — the server
          is idempotent.
        </p>
      </div>
    );
  }

  if (state.kind === "fail") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3 rounded-2xl border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">Could not verify</h1>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <p className="text-xs text-muted-foreground">
          paymentID: <code>{paymentID}</code> · status: <code>{status}</code>
        </p>
        <p className="text-xs text-muted-foreground">
          If money left your account, re-check the payment from your payment
          history.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/student/payments"
            className="inline-flex h-9 items-center justify-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted"
          >
            Payment history
          </Link>
          <Link
            href={returnTo}
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Back to my fees
          </Link>
        </div>
      </div>
    );
  }

  const ok = state.result.success;
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 rounded-2xl border bg-card p-6 text-center">
      <h1 className="text-lg font-bold">
        {ok ? "Payment successful" : "Payment not completed"}
      </h1>
      <p className="text-sm text-muted-foreground">{state.result.message}</p>
      {ok && state.result.receiptNumber ? (
        <p className="text-sm">
          Receipt:{" "}
          <span className="font-mono font-semibold">
            {state.result.receiptNumber}
          </span>
        </p>
      ) : null}

      {ok && state.result.transactionId ? (
        <p className="text-xs text-muted-foreground">
          Your Student ID and admission status update as soon as the payment is
          confirmed. This page already refreshed them.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {ok ? (
          <>
            <button
              type="button"
              disabled={!txId || downloadReceipt.isPending}
              onClick={handleDownloadReceipt}
              className="inline-flex h-9 items-center justify-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {downloadReceipt.isPending ? "Downloading…" : "Download receipt"}
            </button>
            <Link
              href={returnTo}
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Continue
            </Link>
          </>
        ) : (
          <>
            {txId ? (
              <button
                type="button"
                disabled={verifying || verifyMutation.isPending}
                onClick={handleVerify}
                className="inline-flex h-9 items-center justify-center rounded-2xl border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                {verifying ? "Verifying…" : "Verify again"}
              </button>
            ) : null}
            <Link
              href={returnTo}
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Back
            </Link>
          </>
        )}
      </div>

      {!ok ? (
        <p className="text-xs text-muted-foreground">
          If money left your account, re-check the payment from your{" "}
          <Link href="/student/payments" className="underline">
            payment history
          </Link>
          .
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Refreshing this page is safe — duplicate callbacks count as success.
        </p>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading payment status…
        </div>
      }
    >
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <CallbackBody />
      </div>
    </Suspense>
  );
}
