import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

export function useReportDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  async function download(reportId: string, path: string, params: Record<string, string>, filename: string) {
    setDownloadingId(reportId); setError(null);
    try {
      const url = new URL(`${API_BASE_URL}${path}`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
      const res = await fetch(url.toString(), { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
      if (!res.ok) throw new Error("تعذر تحميل التقرير");
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = objectUrl; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "خطأ"); }
    finally { setDownloadingId(null); }
  }
  return { download, downloadingId, error };
}
