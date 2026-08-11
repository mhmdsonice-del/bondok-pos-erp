import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

interface Tax { id: string; name: string; rate: number }
interface Company { id: string; name: string; taxNumber?: string; currency: string }

export function useSettings() { return useQuery({ queryKey: ["settings","company"], queryFn: () => apiRequest<Company>("/settings/company") }); }
export function useUpdateSettings() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { name?: string; taxNumber?: string; currency?: string }) => apiRequest("/settings/company", { method: "PATCH", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }) }); }
export function useTaxes() { return useQuery({ queryKey: ["settings","taxes"], queryFn: () => apiRequest<Tax[]>("/settings/taxes") }); }
export function useCreateTax() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { name: string; rate: number }) => apiRequest("/settings/taxes", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["settings","taxes"] }) }); }
