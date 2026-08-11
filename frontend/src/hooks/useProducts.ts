import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";
import { Product } from "@/types/pos";

export function useProducts(params?: Record<string, string>) { return useQuery({ queryKey: ["products", params], queryFn: () => apiRequest<{ items: Product[] }>("/products", { params }) }); }
