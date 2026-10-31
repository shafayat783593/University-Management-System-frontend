"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardPageHeader, DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdmissionListRow } from "@/api";
import { useAdmissionApplications, useReviewAdmissionApplication } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

const TABS = ["SUBMITTED", "APPROVED", "REJECTED", "ALL"] as const;

function statusVariant(status: string) {
  if (status === "APPROVED") return "success" as const;
  if (status === "REJECTED") return "destructive" as const;
  return "warning" as const;
}

// One application row + inline review box (Task 39: approve / reject + reason).
function ApplicationCard({ row }: { row: AdmissionListRow }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const review = useReviewAdmissionApplication();
  const pending = row.status === "SUBMITTED";

  function decide(status: "APPROVED" | "REJECTED") {
    if (status === "REJECTED" && reason.trim().length < 5) {
      toast.error("A reason of at least 5 characters is required to reject.");
      return;
    }
    review.mutate(
      {
        id: row.id,
        payload: {
          status,
          rejectionReason: status === "REJECTED" ? reason.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(status === "APPROVED" ? "Approved — admission fee invoiced." : "Application rejected.");
          setOpen(false);
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Review failed.")),
      },
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">{row.student.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.student.user.email}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {row.previousInstitution}
            {row.sscGpa != null ? ` · SSC ${row.sscGpa}` : ""}
            {row.hscGpa != null ? ` · HSC ${row.hscGpa}` : ""}
          </p>
          {row.rejectionReason ? <p className="mt-1 text-xs">Reason: {row.rejectionReason}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
          {pending ? (
            <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
              {open ? "Close" : "Review"}
            </Button>
          ) : null}
        </div>
      </div>

      {open && pending ? (
        <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <label className="grid gap-1 text-[13px] font-semibold">
            Rejection reason (required to reject, min 5 chars)
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. SSC certificate missing" className="h-9" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={review.isPending} onClick={() => decide("APPROVED")}>
              {review.isPending ? "Saving…" : "Approve + invoice fee"}
            </Button>
            <Button size="sm" variant="destructive" disabled={review.isPending} onClick={() => decide("REJECTED")}>
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function AdmissionReviewList() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("SUBMITTED");
  const query = useAdmissionApplications(tab);
console.log("quary",query)
 
  
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Admission applications"
        subtitle="Verify, test, approve — approval invoices the admission fee."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <DashboardPanel title={tab === "ALL" ? "All applications" : `${tab} applications`}>
        {query.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-8 text-center text-sm">
            <p className="font-semibold">Could not load applications.</p>
            <button type="button" onClick={() => query.refetch()} className="mt-2 h-8 rounded-xl border px-3 font-medium hover:bg-muted">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <ApplicationCard key={row.id} row={row} />
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  );
}
