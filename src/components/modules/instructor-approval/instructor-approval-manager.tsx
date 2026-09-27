"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Search } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-ui";
import { Input } from "@/components/ui/input";
import { useGetInstructorApplications } from "@/hooks";
import type { InstructorApplication, GetInstructorApplicationsParams } from "@/components/types";
import InstructorApprovalTable from "./instructor-approval-table";
import InstructorApprovalTableLoading from "./instructor-approval-table-loading";
import InstructorReviewSheet from "./instructor-review-sheet";
import useDebounce from "@/hooks/searchDebounce.hook";
import InstructorApprovalTabs, { ApprovalTab } from "./instructor-approval-tabs";

const PAGE_SIZE = 10;

export default function InstructorApprovalManager() {
  const [tab, setTab] = useState<ApprovalTab>("PENDING");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<InstructorApplication | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);


  const param : GetInstructorApplicationsParams={
    page,
    limit: PAGE_SIZE,
    verificationStatus: tab,
    searchTerm: debouncedSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  }
  const { data, isLoading, isError, refetch } = useGetInstructorApplications(param);



  const applications: InstructorApplication[] = data?.data ?? [];
  const meta = data?.meta;

  const handleTabChange = (value: ApprovalTab) => {
    setTab(value);
    setPage(1);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <DashboardPanel
        title="Instructor applications"
        subtitle={
          meta
            ? `${meta.total} total • page ${meta.page} of ${meta.totalPages}`
            : "Review, approve or reject instructor applications."
        }
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearch(e)}
              placeholder="Search name or email…"
              className="pl-9"
            />
          </div>
        }
      >
        <div className="mb-4">
          <InstructorApprovalTabs value={tab} onChange={handleTabChange} />
        </div>

        {isLoading ? (
          <InstructorApprovalTableLoading rows={PAGE_SIZE} />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
            <p className="text-sm font-semibold">Could not load applications</p>
            <p className="text-[13px] text-muted-foreground">
              Check your connection or API base URL, then retry.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : (
          <InstructorApprovalTable
            applications={applications}
            page={data?.meta?.page ?? page}
            totalPages={meta?.totalPages ?? 1}
            onPageChange={(p) => setPage(p)}
            onReview={(app) => setSelected(app)}
          />
        )}
      </DashboardPanel>

      <InstructorReviewSheet
        application={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
