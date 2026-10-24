import { useMutation } from "@tanstack/react-query";
import { downloadReceiptPdf } from "@/api/payments.api";

// Download a PDF receipt for one PAID payment.
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: ({ paymentId, filename }: { paymentId: string; filename: string }) =>
      downloadReceiptPdf(paymentId, filename),
  });
}