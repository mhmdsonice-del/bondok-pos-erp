import { Printer } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function ReceiptModal({ order, onClose }: { order: any; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tm = setTimeout(() => {
      if (printRef.current) {
        const win = window.open("", "_blank", "width=320,height=600");
        if (win) {
          const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>فاتورة ${order.orderNumber ?? order.id}</title><style>body{font-family:system-ui,sans-serif;font-size:13px;max-width:300px;margin:0 auto;padding:16px;color:#1a1a1a}hr{border:none;border-top:1px dashed #999}table{width:100%;border-collapse:collapse}td{padding:4px 0}.total{font-size:18px;font-weight:bold}@media print{@page{margin:0;size:80mm auto}}</style></head><body>${printRef.current.innerHTML}</body></html>`;
          win.document.write(html);
          win.document.close();
          setTimeout(() => { win.print(); win.close(); }, 500);
        }
      }
    }, 100);
    return () => clearTimeout(tm);
  }, [order]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-[320px] overflow-y-auto rounded-lg bg-white p-5">
        <div ref={printRef} style={{ color: "#1a1a1a", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>BONDOK</h2><p style={{ fontSize: 11, margin: "2px 0", color: "#666" }}>{order.branchId?.slice(0, 8) ?? "الفرع الرئيسي"}</p></div>
          <hr style={{ margin: "12px 0" }} />
          <p style={{ fontSize: 11, margin: "4px 0" }}>رقم الفاتورة: {order.orderNumber ?? order.id?.slice(0, 8)}</p>
          <p style={{ fontSize: 11, margin: "4px 0" }}>التاريخ: {new Date().toLocaleString("ar-EG")}</p>
          <hr style={{ margin: "12px 0" }} />
          <table style={{ fontSize: 12 }}>
            <thead><tr style={{ borderBottom: "1px solid #ddd" }}><td style={{ fontWeight: 600 }}>الصنف</td><td style={{ textAlign: "center", fontWeight: 600 }}>الكمية</td><td style={{ textAlign: "right", fontWeight: 600 }}>الإجمالي</td></tr></thead>
            <tbody>{(order.items ?? []).map((item: any, i: number) => <tr key={i}><td>{item.product?.name ?? item.name}</td><td style={{ textAlign: "center" }}>{item.quantity}</td><td style={{ textAlign: "right" }}>{(Number(item.unitPrice ?? item.price) * Number(item.quantity)).toFixed(1)} ج.م</td></tr>)}</tbody>
          </table>
          <hr style={{ margin: "12px 0" }} />
          <p className="total" style={{ textAlign: "center", fontSize: 18, fontWeight: 700, margin: "8px 0" }}>{Number(order.totalAmount ?? order.total).toFixed(1)} ج.م</p>
          <p style={{ textAlign: "center", fontSize: 10, color: "#999", marginTop: 8 }}>شكرًا لزيارتكم</p>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">إغلاق</button>
          <button onClick={() => { if (printRef.current) { const win = window.open("", "_blank", "width=320,height=600"); if (win) { win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>فاتورة</title><style>body{font-family:system-ui;font-size:13px;max-width:300px;margin:0 auto;padding:16px}@media print{@page{margin:0;size:80mm auto}}</style></head><body>${printRef.current.innerHTML}</body></html>`); win.document.close(); setTimeout(() => { win.print(); win.close(); }, 300); } } }} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-flame-500 py-2 text-sm font-bold text-white hover:bg-flame-600"><Printer size={14} />طباعة</button>
        </div>
      </div>
    </div>, document.body);
}
