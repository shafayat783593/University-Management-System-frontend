import type { ApiResponse, AdmissionListRow } from "@/components/types";

export interface AdmissionListRow {
  id: string;
  student: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  previousInstitution: string | null;
  sscGpa?: number;
  hscGpa?: number;
  rejectionReason?: string;
}

export async function getAdmissionApplications(tab: string): Promise<AdmissionListRow[]> {
  const response = await fetch(`/admissions/applications?tab=${tab}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch admissions: ${response.status}`);
  }
  return response.json();
}

export async function createAdmissionApplication(
  studentId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
): Promise<AdmissionListRow> {
  const response = await fetch(`/admissions/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentId,
      status,
      rejectionReason,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create application: ${response.status}`);
  }
  return response.json();
}

export async function updateAdmissionApplication(
  id: string,
  payload: {
    status: "APPROVED" | "REJECTED" | "APPROVED" | "REJECTED",
    rejectionReason?: string,
  }
): Promise<AdmissionListRow> {
  const response = await fetch(`/admissions/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update application: ${response.status}`);
  }
  return response.json();
}

export async function deleteAdmissionApplication(id: string): Promise<void> {
  const response = await fetch(`/admissions/applications/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete application: ${response.status}`);
  }
}
