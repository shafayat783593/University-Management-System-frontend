"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyOverdueInstallments } from "@/hooks/invoices.hook";

export function OverdueDuesBanner() {
  const router = useRouter();
  const { data, isLoading, isError } = useMyOverdueInstallments();

  const first = useMemo(() => (data && data.length > 0 ? data[0] : undefined), [data]);

  if (isLoading || isError || !first) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
      <div className="flex-1">
        <p className="font-semibold text-destructive">
          Installment {first.number} is overdue (৳{first.remaining}, due {new Date(first.dueDate).toLocaleDateString()})
        </p>
        <p className="text-[13px] text-muted-foreground">
          Enrollment, results and transcript are locked until you pay.
        </p>
      </div>
      <div className="shrink-0">
        <Button size="sm" onClick={() => router.push("/student/payments/my-fees")}>
          Pay now
        </Button>
      </div>
    </div>
  );
}

