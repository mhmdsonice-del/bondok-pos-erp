import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

interface DateRangeParams { branchId: string; start: string; end: string; [key: string]: any }
interface DashboardSummary { totalSales: number; invoiceCount: number; averageInvoice: number; grossProfit: number }

export function useDashboardSummary(params: DateRangeParams | null) { return useQuery({ queryKey: ["dashboard","summary",params], queryFn: () => apiRequest<DashboardSummary>("/dashboard/summary",{params}), enabled: !!params, refetchInterval: 30000 }); }
export function useDailySales(params: DateRangeParams | null) { return useQuery({ queryKey: ["dashboard","daily-sales",params], queryFn: () => apiRequest<{date:string;total:number}[]>("/dashboard/sales/daily",{params}), enabled: !!params }); }
export function useTopProducts(params: DateRangeParams | null) { return useQuery({ queryKey: ["dashboard","top-products",params], queryFn: () => apiRequest<{product:{name:string};quantitySold:number}[]>("/dashboard/top-products",{params}), enabled: !!params }); }
export function useSmartAlerts(branchId: string) { return useQuery({ queryKey: ["dashboard","alerts",branchId], queryFn: () => apiRequest<{type:string;message:string}[]>("/dashboard/alerts",{params:{branchId}}), enabled: !!branchId, refetchInterval: 60000 }); }
