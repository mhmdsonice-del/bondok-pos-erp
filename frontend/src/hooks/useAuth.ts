import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
import { useAuthStore, BranchInfo } from "@/store/authStore";

interface LoginResponse { requiresTwoFactor: boolean; accessToken?: string; refreshToken?: string; user?: { id: string; fullName: string; role: string; companyId: string; branchIds: string[] }; branches?: BranchInfo[] }

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: { username: string; password: string; twoFactorCode?: string }) => apiRequest<LoginResponse>("/auth/login", { method: "POST", body: input, skipBranchHeader: true }),
    onSuccess: (data) => { if (!data.requiresTwoFactor && data.accessToken && data.refreshToken && data.user) setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, branches: data.branches }); }
  });
}
