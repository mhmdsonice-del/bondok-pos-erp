import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

interface ProductInput { sku: string; barcode?: string; name: string; categoryId?: string; costPrice: number; sellPrice: number; reorderPoint?: number }

export function useCreateProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: (input: ProductInput) => apiRequest("/products", { method: "POST", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }) }); }
export function useUpdateProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => apiRequest(`/products/${id}`, { method: "PATCH", body: input }), onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }) }); }
export function useDeleteProduct() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => apiRequest(`/products/${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }) }); }
