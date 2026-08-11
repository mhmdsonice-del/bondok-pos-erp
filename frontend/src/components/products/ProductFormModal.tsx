import { useState, useEffect, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProductMutations";
import { useProducts } from "@/hooks/useProducts";
import { ApiError } from "@/lib/apiClient";

export function ProductFormModal({ isOpen, onClose, editProductId }: { isOpen: boolean; onClose: () => void; editProductId: string | null }) {
  const { data } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const existing = editProductId ? (data?.items ?? []).find((p) => p.id === editProductId) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [sellPrice, setSellPrice] = useState(existing ? String(existing.sellPrice) : "");
  const [costPrice, setCostPrice] = useState(existing ? String(existing.costPrice) : "");
  const [barcode, setBarcode] = useState(existing?.barcode ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (existing) { setName(existing.name); setSku(existing.sku); setSellPrice(String(existing.sellPrice)); setCostPrice(String(existing.costPrice)); setBarcode(existing.barcode ?? ""); } }, [editProductId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!name.trim() || !sku.trim()) { setError("الاسم و SKU مطلوبان"); return; }
    try {
      if (existing) await updateProduct.mutateAsync({ id: existing.id, data: { name: name.trim(), sku: sku.trim(), sellPrice: Number(sellPrice), costPrice: Number(costPrice), barcode: barcode.trim() || undefined } });
      else await createProduct.mutateAsync({ name: name.trim(), sku: sku.trim(), sellPrice: Number(sellPrice), costPrice: Number(costPrice), barcode: barcode.trim() || undefined });
      onClose();
    } catch (err) { setError(err instanceof ApiError ? err.message : "حصل خطأ"); }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? "تعديل منتج" : "منتج جديد"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div><label className="text-xs text-sesame-100/50">الاسم *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">SKU *</label><input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-sesame-100/50">سعر البيع</label><input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div><div><label className="text-xs text-sesame-100/50">سعر التكلفة</label><input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div></div>
        <div><label className="text-xs text-sesame-100/50">الباركود</label><input value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        {error && <p className="text-sm text-chili-500">{error}</p>}
        <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button><Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? "جاري..." : "حفظ"}</Button></div>
      </form>
    </Modal>
  );
}
