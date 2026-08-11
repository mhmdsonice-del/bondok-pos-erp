import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export function useEmployees() { return useQuery({ queryKey: ["employees"], queryFn: () => apiRequest<any[]>("/employees") }); }
export function useCreateEmployee() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: any) => apiRequest("/employees", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }) }); }
