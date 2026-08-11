import { useState, useMemo } from "react";
import { FileText, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReportPrintModal } from "@/components/reports/ReportPrintModal";
import { useActiveBranch } from "@/lib/activeContext";
import { useReportRows } from "@/hooks/useReportRows";
import { useReportDownload } from "@/hooks/useReportDownload";

const REPORT_TABS = [
  { key: "sales", label: "المبيعات" },
  { key: "products", label: "المنتجات" },
  { key: "profit", label: "الأرباح" },
  { key: "employees", label: "الموظفين" },
  { key: "customers", label: "العملاء" },
  { key: "suppliers", label: "الموردين" },
  { key: "tax", label: "الضرائب" },
  { key: "cash", label: "الخزنة" },
] as const;

export default function ReportsPage() {
  const { branchId } = useActiveBranch();
  const [tab, setTab] = useState<string>("sales");
  const [printRows, setPrintRows] = useState<any>(null);

  const range = useMemo(() => {
    if (!branchId) return null;
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const start = new Date(); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0);
    return { branchId, start: start.toISOString(), end: end.toISOString() };
  }, [branchId]);

  const { data: rows, isLoading, isError } = useReportRows(tab, range);
  const download = useReportDownload(tab, range);

  if (!branchId) return <div className="flex h-64 items-center justify-center"><p className="text-sesame-100/60">الرجاء اختيار الفرع لعرض التقارير</p></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">التقارير</h1><Button variant="secondary" size="md" className="flex items-center gap-2" onClick={() => download.mutate()} disabled={download.isPending}>{download.isPending ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}تصدير Excel</Button></div>
      <div className="mb-4 flex gap-2 overflow-x-auto">{REPORT_TABS.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-flame-500 text-white" : "bg-char-900 text-sesame-100/60 hover:bg-char-800"}`}>{t.label}</button>)}</div>
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sesame-100/40" /></div>}
      {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل التقرير — تأكد إن الـ Backend شغال.</p>}
      {!isLoading && !isError && rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-char-800">
          <table className="w-full text-sm">
            <thead className="bg-char-900 text-right text-sesame-100/50">
              <tr>{Object.keys(rows[0] ?? {}).filter((k) => k !== "productId" && k !== "registerId").map((key) => <th key={key} className="px-4 py-3 font-medium whitespace-nowrap">{key}</th>)}</tr>
            </thead>
            <tbody>{rows.map((row: any, i: number) => <tr key={i} className="border-t border-char-800 bg-char-950">{Object.entries(row).filter(([k]) => k !== "productId" && k !== "registerId").map(([_, val]) => <td key={_} className="px-4 py-3 text-sesame-100/70 whitespace-nowrap">{String(val ?? "—")}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {!isLoading && !isError && rows && rows.length === 0 && <p className="py-10 text-center text-sesame-100/40">لا توجد بيانات في النطاق المحدد</p>}
      {printRows && <ReportPrintModal rows={printRows} title={REPORT_TABS.find((t) => t.key === tab)?.label ?? "تقرير"} onClose={() => setPrintRows(null)} />}
    </div>
  );
}