// §1: money is always number (BDT) in JSON; UI shows ৳ + Intl.NumberFormat("en-BD").
// Never compute amounts client-side to send to the server — amount is server-decided.

const bdt = new Intl.NumberFormat("en-BD");

export function formatBDT(amount: number): string {
  return `৳${bdt.format(amount)}`;
}

export function formatDueDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
