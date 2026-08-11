import { useAuthStore } from "@/store/authStore";

export function getActiveBranchId(): string | null { return useAuthStore.getState().activeBranchId; }
export function getActiveWarehouseId(): string | null { return useAuthStore.getState().activeWarehouseId; }

export function getActiveContext() {
  const state = useAuthStore.getState();
  return { branchId: state.activeBranchId, warehouseId: state.activeWarehouseId, companyId: state.user?.companyId ?? null };
}

export function useActiveBranch() {
  return useAuthStore((s) => ({ branchId: s.activeBranchId, warehouseId: s.activeWarehouseId, setActiveBranch: s.setActiveBranch, branches: s.branches, hasMultipleBranches: s.branches.length > 1 }));
}
