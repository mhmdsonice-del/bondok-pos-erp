import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
import { BranchInfo, useAuthStore } from "@/store/authStore";

export function useBranches() { return useQuery({ queryKey: ["branches"], queryFn: () => apiRequest<BranchInfo[]>("/branches") }); }
export function useCreateBranch() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { name: string; address?: string; phone?: string }) => apiRequest("/branches", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }) }); }
