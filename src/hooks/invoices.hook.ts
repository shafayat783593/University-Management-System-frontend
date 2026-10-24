import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInvoiceAdjustment,
  applyLateFees,
  cancelInvoice,
  createApplicationInvoice,
  createIdCardInvoice,
  generateMySemesterInvoice,
  generateSemesterInvoices,
  getAllInvoices,
  getInvoiceById,
  getMyInvoiceSummary,
  getMyInvoices,
  getMyOverdueInstallments,
  getOutstandingReport,
  getOverdueReport,
} from "@/api";
import { ID_CARD_STATUS_KEY } from "@/hooks/auth.hook";

const MY_INVOICES_KEY = ["invoices", "my"] as const;
const INVOICES_KEY = ["invoices"] as const;

/* Student ------------------------------------------------------ */

export function useMyInvoices(params?: {
  type?: string;
  status?: string;
  semesterId?: string;
}) {
  return useQuery({
    queryKey: [...MY_INVOICES_KEY, "list", params ?? {}],
    queryFn: () => getMyInvoices(params),
    staleTime: 30 * 1000,
  });
}

export function useMyInvoiceSummary() {
  return useQuery({
    queryKey: [...MY_INVOICES_KEY, "summary"],
    queryFn: getMyInvoiceSummary,
    staleTime: 30 * 1000,
  });
}

export function useMyOverdueInstallments() {
  return useQuery({
    queryKey: [...MY_INVOICES_KEY, "overdue"],
    queryFn: getMyOverdueInstallments,
    staleTime: 30 * 1000,
  });
}

export function useInvoiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...MY_INVOICES_KEY, "detail", id ?? ""],
    queryFn: () => getInvoiceById(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateApplicationInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApplicationInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_INVOICES_KEY });
    },
  });
}

// The ID card charge. Invalidates the invoices list and the ID card status,
// because paying it is what unlocks the download.
export function useCreateIdCardInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIdCardInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_INVOICES_KEY });
      void queryClient.invalidateQueries({ queryKey: ID_CARD_STATUS_KEY });
    },
  });
}

export function useGenerateMySemesterInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (semesterId: string) => generateMySemesterInvoice(semesterId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_INVOICES_KEY });
    },
  });
}

/* Admin -------------------------------------------------------- */

export function useAllInvoices(params?: {
  status?: string;
  type?: string;
  semesterId?: string;
  studentId?: string;
  departmentId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...INVOICES_KEY, "all", params ?? {}],
    queryFn: () => getAllInvoices(params),
    staleTime: 30 * 1000,
  });
}

export function useGenerateSemesterInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateSemesterInvoices,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useOutstandingReport(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...INVOICES_KEY, "outstanding", params ?? {}],
    queryFn: () => getOutstandingReport(params),
    staleTime: 30 * 1000,
  });
}

export function useOverdueReport() {
  return useQuery({
    queryKey: [...INVOICES_KEY, "overdue"],
    queryFn: getOverdueReport,
    staleTime: 30 * 1000,
  });
}

export function useApplyLateFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyLateFees,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useAddInvoiceAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        type: "WAIVER" | "SCHOLARSHIP" | "DISCOUNT" | "ADJUSTMENT";
        amount: number;
        reason: string;
      };
    }) => addInvoiceAdjustment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelInvoice(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}
