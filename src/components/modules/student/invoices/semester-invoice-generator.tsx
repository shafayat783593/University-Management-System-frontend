"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Invoice } from "@/api";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateMySemesterInvoice, useSemesters } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";
import { getApiErrorStatus } from "@/lib/apiClient";
import { formatBDT } from "@/lib/format";

// Task 21B — pick an OPEN semester → POST /invoices/semester/generate-my.
// Tuition = billable credits × per-credit rate; server decides every taka.
export default function SemesterInvoiceGenerator() {
  const semestersQuery = useSemesters();
  const generate = useGenerateMySemesterInvoice();
  const [semesterId, setSemesterId] = useState("");
  const [done, setDone] = useState<Invoice | null>(null);

  const semesters = semestersQuery.data?.items ?? [];
  const open = semesters.filter((s) => s.status === "OPEN");

  function handleGenerate() {
    if (!semesterId) {
      toast.error("Pick a semester first.");
      return;
    }
    generate.mutate(semesterId, {
      onSuccess: (invoice) => {
        setDone(invoice);
        toast.success(`Invoice ${invoice.invoiceNumber ?? ""} ready.`.trim());
      },
      onError: (error) => {
        const status = getApiErrorStatus(error);
        if (status === 403) {
          toast.error("Pay your admission fee to confirm admission", {
            description: getApiErrorMessage(error, "Confirm admission first."),
          });
          return;
        }
        if (status === 409) {
          toast.error("Already invoiced", {
            description: getApiErrorMessage(
              error,
              "This semester is already invoiced.",
            ),
          });
          return;
        }
        toast.error(getApiErrorMessage(error, "Could not generate invoice."));
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Semester invoice"
        subtitle="Generate your semester invoice for enrolled courses, then pay it."
      />
      {semestersQuery.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <DashboardPanel title="Pick a semester">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={semesterId}
              onValueChange={(v) => setSemesterId(v ?? "")}
            >
              <SelectTrigger className="h-11 w-64">
                <SelectValue placeholder="Select an OPEN semester" />
              </SelectTrigger>
              <SelectContent>
                {(open.length > 0 ? open : semesters).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!semesterId || generate.isPending}
              onClick={handleGenerate}
              className="h-11"
            >
              {generate.isPending ? "Generating…" : "Generate my invoice"}
            </Button>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Adding courses later creates a supplementary invoice for the extra
            credits only.
          </p>
        </DashboardPanel>
      )}

      {done ? (
        <DashboardPanel title={`Invoice ${done.invoiceNumber ?? ""}`}>
          <p className="text-sm">
            Payable: <strong>{formatBDT(done.payableAmount)}</strong> ·{" "}
            {done.installments.length} installment(s)
          </p>
          <Link
            href="/student/payments/my-fees"
            className="mt-3 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Go to pay →
          </Link>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
