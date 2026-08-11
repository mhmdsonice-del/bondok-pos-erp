import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
import { useActiveBranch } from "@/lib/activeContext";

export function useCurrentRegister() { const { branchId } = useActiveBranch(); return useQuery({ queryKey: ["cashRegister","current",branchId], queryFn: () => apiRequest<any>("/cash-register/current", { params: { branchId } }), enabled: !!branchId }); }
export function useOpenRegister() { const qc = useQueryClient(); const { branchId } = useActiveBranch(); return useMutation({ mutationFn: (openingAmount: number) => apiRequest("/cash-register/open", { method: "POST", body: { branchId, openingAmount } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cashRegister"] }) }); }
export function useRecordCashMovement() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { cashRegisterId: string; type: string; amount: number; notes?: string }) => apiRequest("/cash-register/movements", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cashRegister"] }) }); }
export function useCloseRegister() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { id: string; actualClosingAmount: number; closingReason?: string }) => apiRequest(`/cash-register/${input.id}/close`, { method: "POST", body: { actualClosingAmount: input.actualClosingAmount, closingReason: input.closingReason } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cashRegister"] }) }); }
