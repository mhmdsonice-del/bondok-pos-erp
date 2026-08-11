import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export function useSuppliers() { return useQuery({ queryKey: ["suppliers"], queryFn: () => apiRequest<any[]>("/suppliers") }); }
export function useCreateSupplier() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { name: string; phone?: string }) => apiRequest("/suppliers", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }) }); }
