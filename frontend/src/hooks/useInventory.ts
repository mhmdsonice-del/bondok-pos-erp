import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export function useInventory(warehouseId: string) { return useQuery({ queryKey: ["inventory", warehouseId], queryFn: () => apiRequest<any[]>(`/inventory/${warehouseId}`), enabled: !!warehouseId }); }
export function useStockAlerts(warehouseId: string) { return useQuery({ queryKey: ["inventory","alerts",warehouseId], queryFn: () => apiRequest<any[]>(`/inventory/alerts/low-stock`, { params: { warehouseId } }), enabled: !!warehouseId }); }
export function useTransferStock() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: { fromWarehouseId: string; toWarehouseId: string; productId: string; quantity: number }) => apiRequest("/inventory/transfer", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }) }); }
