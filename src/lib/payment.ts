import { initPayment } from "@/api";

const RETURN_KEY = "payReturnTo";

/**
 * Task 13 / §6 — start a bKash payment and hand the browser to the gateway.
 *
 * The server picks the amount (next unpaid installment) unless `amount` is
 * given and the invoice allows partial payment. `returnTo` is remembered so
 * /payment/callback can send the student back where they started.
 */
export async function redirectToBkash(
  invoiceId: string,
  returnTo: string,
  amount?: number,
): Promise<void> {
  const payment = await initPayment(
    amount == null ? { invoiceId } : { invoiceId, amount },
  );
  if (!payment?.bkashURL) {
    throw new Error("The payment gateway did not return a bKash URL.");
  }
  try {
    sessionStorage.setItem(RETURN_KEY, returnTo);
  } catch {
    /* private mode — the callback falls back to the default page */
  }
  window.location.href = payment.bkashURL;
}
