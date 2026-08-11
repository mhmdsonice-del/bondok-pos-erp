import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
import { OrderType, PaymentMethod, CartLine } from "@/types/pos";

interface CreateOrderInput { branchId: string; customerId?: string; type: OrderType; items: { productId: string; quantity: number; discount?: number; notes?: string }[]; couponCode?: string; taxRatePercent?: number }

export function cartLinesToOrderItems(lines: CartLine[]) { return lines.map((l) => ({ productId: l.product.id, quantity: l.quantity, notes: l.notes })); }

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: CreateOrderInput) => apiRequest("/orders", { method: "POST", body: input }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dashboard"] }); } });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ orderId, payments }: { orderId: string; payments: { method: PaymentMethod; amount: number }[] }) => apiRequest(`/orders/${orderId}/complete`, { method: "POST", body: { payments } }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dashboard"] }); queryClient.invalidateQueries({ queryKey: ["inventory"] }); } });
}

export function useHoldOrder() { return useMutation({ mutationFn: (orderId: string) => apiRequest(`/orders/${orderId}/hold`, { method: "POST" }) }); }
export function useCancelOrder() { return useMutation({ mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) => apiRequest(`/orders/${orderId}/cancel`, { method: "POST", body: { reason } }) }); }
