import { useState } from "react";
import { Search, PackageOpen, AlertTriangle, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useInventory, useStockAlerts, useTransferStock } from "@/hooks/useInventory";
import { useActiveBranch } from "@/lib/activeContext";

export default function InventoryPage() {
  const { branchId } = useActiveBranch();
  const [search, setSearch] = useState("");
  const [transferModal, setTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [transferQty, setTransferQty] = useState("1");
  const [toWarehouseId, setToWarehouseId] = useState("");
  
  const { data: inventory, isLoading, isError } = useInventory(branchId ?? "");
  const { data: alerts } = useStockAlerts(branchId ?? "");
  const transferStock = useTransferStock();

  const filtered = (inventory ?? []).filter((item) => item.product?.name?.includes(search) || item.product?.sku?.includes(search));

  if (!branchId) return <div className="flex h-64 items-center justify-center"><p className="text-sesame-100/60">الرجاء اختيار الفرع لعرض المخزون</p></div>;

  return (
    <div className="p-6">
      <h1 className="mb-6 font-display text-2xl tracking-wide">المخزون</h1>
      {(alerts ?? []).length > 0 && (
        <div className="mb-4 rounded-card border border-ember-500/30 bg-ember-500/10 p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-ember-500"><AlertTriangle size={16} /> تنبيهات المخزون</p>
          <ul className="flex flex-col gap-1 text-sm">{(alerts ?? []).map((a, i) => <li key={i} className="text-sesame-100/70">⚠️ {a.product?.name}: {a.quantity} متبقي</li>)}</ul>
        </div>
      )}
      <div className="relative mb-4 w-72"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-sesame-100/40" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو SKU..." className="w-full rounded-lg bg-char-900 border border-char-800 py-2 pr-9 pl-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400" /></div>
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sesame-100/40" /></div>}
      {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل المخزون</p>}
      {!isLoading && !isError && (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-card border border-char-800 bg-char-900 p-4">
              <PackageOpen className="text-sesame-100/40" size={20} />
              <div className="flex-1"><p className="font-semibold">{item.product?.name}</p><p className="text-xs text-sesame-100/50">SKU: {item.product?.sku}</p></div>
              <div className="text-right"><p className="font-display text-lg">{Number(item.quantity).toLocaleString()}</p><p className="text-xs text-sesame-100/50">{item.product?.reorderPoint ? `الحد الأدنى: ${item.product.reorderPoint}` : ""}</p></div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(item); setTransferModal(true); }}><ArrowLeftRight size={14} className="ml-1" />تحويل</Button>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title={`تحويل مخزون: ${selectedProduct?.product?.name ?? ""}`}>
        <div className="flex flex-col gap-3">
          <input type="number" min="1" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} placeholder="الكمية" className="rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" />
          <input value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)} placeholder="معرّف المخزن المستهدف" className="rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" />
          <Button variant="primary" disabled={transferStock.isPending || !toWarehouseId} onClick={() => transferStock.mutate({ fromWarehouseId: selectedProduct?.warehouseId ?? "", toWarehouseId, productId: selectedProduct?.productId ?? "", quantity: Number(transferQty) }, { onSuccess: () => setTransferModal(false) })}>{transferStock.isPending ? "جاري..." : "تأكيد التحويل"}</Button>
        </div>
      </Modal>
    </div>
  );
}