import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";

export function ReportPrintModal({ rows, title, onClose }: { rows: any[]; title: string; onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);

  function printReport() {
    if (!contentRef.current) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const columns = Object.keys(rows[0] ?? {});
    const tableHtml = `<table style="width:100%;border-collapse:collapse;font-size:13px;direction:rtl"><thead><tr style="background:#eee">${columns.map((h) => `<th style="border:1px solid #ccc;padding:8px;text-align:right">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${columns.map((c) => `<td style="border:1px solid #ccc;padding:6px;text-align:right">${r[c] ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui;margin:20px;color:#333}h2{text-align:center;margin-bottom:20px}@media print{@page{margin:10mm}}</style></head><body><h2>${title}</h2>${tableHtml}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }

  useEffect(() => { function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); } window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-card border border-char-800 bg-char-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-char-800 px-6 py-4"><h2 className="font-display text-lg">{title}</h2><div className="flex gap-2"><button onClick={printReport} className="flex items-center gap-1 rounded-lg bg-flame-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-flame-600"><Printer size={14} />طباعة / PDF</button><button onClick={onClose} className="rounded-lg p-1.5 text-sesame-100/40 hover:text-sesame-50"><X size={16} /></button></div></div>
        <div className="overflow-auto p-4" ref={contentRef}><table className="w-full text-sm"><thead><tr className="bg-char-800 text-sesame-100/60">{Object.keys(rows[0] ?? {}).map((h) => <th key={h} className="px-4 py-3 text-right font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-char-800">{Object.values(row).map((val: any, j) => <td key={j} className="px-4 py-3 text-sesame-100/70">{String(val ?? "—")}</td>)}</tr>)}</tbody></table></div>
      </div>
    </div>, document.body);
}
