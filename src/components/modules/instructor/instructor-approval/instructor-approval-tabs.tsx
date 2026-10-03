import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InstructorVerificationStatus } from "@/components/types";
import { Badge } from "@/components/ui/badge";

export type ApprovalTab = InstructorVerificationStatus | "ALL";

const TABS: { value: ApprovalTab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function InstructorApprovalTabs({
  value,
  onChange,
  counts,
}: {
  value: ApprovalTab;
  onChange: (value: ApprovalTab) => void;
  counts?: Partial<Record<ApprovalTab, number>>;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as ApprovalTab)}
    >
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {typeof counts?.[tab.value] === "number" ? (
              <Badge
                variant={
                  tab.value === "PENDING"
                    ? "warning"
                    : tab.value === "APPROVED"
                      ? "success"
                      : tab.value === "REJECTED"
                        ? "destructive"
                        : "secondary"
                }
                className="ml-1"
              >
                {counts?.[tab.value]}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
