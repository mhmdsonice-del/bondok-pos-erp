import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export function useReportRows(reportId: string, jsonPath: string, params: Record<string, string>, enabled: boolean) {
  return useQuery({ queryKey: ["report-rows", reportId, params], queryFn: () => apiRequest<Record<string, unknown>[]>("/reports/" + jsonPath, { params }), enabled });
}
