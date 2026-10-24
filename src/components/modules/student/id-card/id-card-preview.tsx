"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";

export interface IdCardPreviewData {
  studentName: string;
  studentIdCode: string | null;
  departmentName: string | null;
  imageUrl: string | null;
  session: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  guardianName: string | null;
  address: string | null;
  universityName: string;
}

/** Same colour coding as the printed PDF badge. */
const bloodColor = (bloodGroup: string | null): string => {
  const key = (bloodGroup ?? "").trim().toUpperCase().replace(/[+-]/g, "");
  if (key === "A") return "text-red-600 border-red-300 bg-red-50";
  if (key === "B") return "text-blue-600 border-blue-300 bg-blue-50";
  if (key === "AB") return "text-violet-600 border-violet-300 bg-violet-50"; // taste-skill-ignore: AB blood group, a domain colour not a brand accent
  if (key === "O") return "text-emerald-600 border-emerald-300 bg-emerald-50";
  return "text-slate-600 border-slate-300 bg-slate-50";
};

const field = (label: string, value: string | null) => (
  <div className="min-w-0">
    <p className="text-[8px] font-semibold tracking-[0.14em] text-muted-foreground">
      {label}
    </p>
    <p className="truncate text-[11px] font-bold text-foreground">
      {value || "-"}
    </p>
  </div>
);

/**
 * Live preview of the printed ID card. Mirrors the PDF layout
 * (server/src/app/lib/pdf.ts) so the student can see exactly what they get
 * before downloading it.
 */
export default function IdCardPreview({ data }: { data: IdCardPreviewData }) {
  return (
    <div className="w-full max-w-[430px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-white shadow-card">
      {/* header */}
      <div className="flex items-start justify-between gap-3 bg-primary px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold tracking-wide text-primary-foreground">
            {data.universityName}
          </p>
          <p className="text-[8px] text-primary-foreground/70">
            Identity Document - Non-transferable
          </p>
        </div>
        <p className="shrink-0 text-[8px] font-bold tracking-[0.16em] text-primary-foreground/70">
          STUDENT ID CARD
        </p>
      </div>
      <div className="h-1 bg-warning" />

      {/* body */}
      <div className="flex gap-3 p-3">
        {/* photo + lower fields */}
        <div className="flex w-[86px] shrink-0 flex-col gap-2">
          <div className="relative h-[108px] w-[86px] overflow-hidden rounded-md bg-slate-200">
            {data.imageUrl ? (
              <Image
                src={data.imageUrl}
                alt={data.studentName}
                fill
                sizes="86px"
                className="object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-[9px] font-bold text-slate-500">
                NO PHOTO
              </span>
            )}
          </div>
          {field("DATE OF BIRTH", data.dateOfBirth)}
          {field("ADDRESS", data.address)}
        </div>

        {/* name block */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-[15px] font-bold text-foreground">
            {data.studentName}
          </p>
          <p className="text-[11px] font-bold text-primary">
            ID: {data.studentIdCode ?? "-"}
          </p>
          {field("DEPARTMENT", data.departmentName)}
          {field("SESSION", data.session)}
          {field("GUARDIAN", data.guardianName)}
        </div>

        {/* blood badge + QR */}
        <div className="flex w-[74px] shrink-0 flex-col items-center gap-2">
          <div
            className={`w-full rounded-md border px-2 py-1 text-center ${bloodColor(
              data.bloodGroup,
            )}`}
          >
            <p className="text-[7px] font-semibold tracking-[0.12em]">
              BLOOD GROUP
            </p>
            <p className="text-[15px] font-bold leading-tight">
              {(data.bloodGroup ?? "-").toUpperCase()}
            </p>
          </div>
          {/* The scannable QR is rendered into the PDF; the browser preview
              shows a placeholder rather than a fake code. */}
          <div className="flex h-[68px] w-[68px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 bg-slate-50">
            <QrCode className="size-5 text-slate-400" />
            <span className="text-[6px] font-semibold tracking-[0.1em] text-slate-500">
              SCAN TO VERIFY
            </span>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2">
        <p className="text-[8px] text-muted-foreground">
          This card is the property of the University.
        </p>
        <p className="shrink-0 text-[8px] font-bold text-foreground">
          VALID WHILE ENROLLED
        </p>
      </div>
    </div>
  );
}
