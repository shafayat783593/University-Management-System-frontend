import PaymentResultView from "@/components/modules/student/payments/payment-result-view";

export const metadata = {
  title: "Payment Result",
  description: "Check your latest fee status after bKash payment.",
};

export default function StudentPaymentResultPage() {
  return <PaymentResultView />;
}
