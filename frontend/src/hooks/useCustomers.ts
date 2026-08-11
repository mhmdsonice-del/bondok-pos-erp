import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export interface Customer { id: string; name: string; phone?: string; email?: string; loyaltyPoints: number; balance: number; creditLimit: number }

export function useCustomers() { return useQuery({ queryKey: ["customers","list"], queryFn: () => apiRequest<Customer[]>("/customers") }); }
export function useCreateCustomer() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { name: string; phone?: string; email?: string; creditLimit?: number }) => apiRequest("/customers", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }) }); }
