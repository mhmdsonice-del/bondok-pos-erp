import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser { id: string; fullName: string; role: string; companyId: string; branchIds: string[] }
export interface BranchInfo { id: string; name: string; warehouseId: string | null }

interface AuthState {
  accessToken: string | null; refreshToken: string | null; user: AuthUser | null; branches: BranchInfo[]; activeBranchId: string | null; activeWarehouseId: string | null;
  setSession: (data: { accessToken: string; refreshToken: string; user: AuthUser; branches?: BranchInfo[] }) => void;
  setAccessToken: (token: string) => void;
  setActiveBranch: (branchId: string, warehouseId?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  accessToken: null, refreshToken: null, user: null, branches: [], activeBranchId: null, activeWarehouseId: null,
  setSession: ({ accessToken, refreshToken, user, branches }) => {
    const state: any = { accessToken, refreshToken, user };
    if (branches) { state.branches = branches; if (branches.length === 1) { state.activeBranchId = branches[0].id; state.activeWarehouseId = branches[0].warehouseId; } }
    set(state);
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  setActiveBranch: (branchId, warehouseId) => { const b = get().branches.find((x) => x.id === branchId); set({ activeBranchId: branchId, activeWarehouseId: warehouseId ?? b?.warehouseId ?? null }); },
  logout: () => set({ accessToken: null, refreshToken: null, user: null, branches: [], activeBranchId: null, activeWarehouseId: null }),
}), { name: "bondok-auth" }));
