import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelFeePayment,
  downloadTransactionReceipt,
  getCollectionReport,
  getMyFees,
  getMyTransactions,
  getTransactionById,
  initBkashPayment,
  initPayment,
  refundPayment,
  verifyPayment,
} from "@/api";

const MY_FEES_KEY = ["my-fees"];
const MY_TRANSACTIONS_KEY = ["payments", "my"];
const PAYMENTS_KEY = ["payments"];

/* Legacy installment flow (current pages) -------------------------- */

export function useMyFees() {
  return useQuery({
    queryKey: MY_FEES_KEY,
    queryFn: getMyFees,
    staleTime: 30 * 1000,
  });
}

// Pay ONE installment — backend returns the bKash URL to redirect to.
export function useInitBkashPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (installmentId: string) => initBkashPayment(installmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_FEES_KEY });
    },
  });
}

// Cancel ONE paid installment (refund). Invalidates so the list refreshes.
export function useCancelFeePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (installmentId: string) => cancelFeePayment(installmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_FEES_KEY });
    },
  });
}

/* §7 contract flow — invoice-keyed payments ------------------------ */

// A payment can confirm admission (Student ID) and change every money total,
// so refresh those caches too — not just the transaction list.
function invalidateMoneyState(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY });
  void queryClient.invalidateQueries({ queryKey: ["invoices", "my"] });
  void queryClient.invalidateQueries({ queryKey: ["admission-application"] });
  void queryClient.invalidateQueries({ queryKey: ["me"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
}

// Start one bKash payment for an invoice, then redirect to bkashURL.
export function useInitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initPayment,
    onSuccess: () => {
      invalidateMoneyState(queryClient);
    },
  });
}

export function useMyTransactions(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...MY_TRANSACTIONS_KEY, "list", params ?? {}],
    queryFn: () => getMyTransactions(params),
    staleTime: 30 * 1000,
  });
}

export function useTransactionDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...MY_TRANSACTIONS_KEY, "detail", id ?? ""],
    queryFn: () => getTransactionById(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useDownloadTransactionReceipt() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      downloadTransactionReceipt(id, filename),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyPayment(id),
    onSuccess: () => {
      invalidateMoneyState(queryClient);
      // Redirect to payment confirmation page after successful verification
      window.location.href = "/student/payments/my-fees";
    },
  });
}

// POST /payments/:id/refund (ADMIN).
export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { amount?: number; reason: string; reverseCharge?: boolean };
    }) => refundPayment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useCollectionReport(params?: {
  from?: string;
  to?: string;
  semesterId?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "collection", params ?? {}],
    queryFn: () => getCollectionReport(params),
    staleTime: 30 * 1000,
  });
}
