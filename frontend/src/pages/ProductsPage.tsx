import { useState } from "react";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { useProducts } from "@/hooks/useProducts";
import { useDeleteProduct } from "@/hooks/useProductMutations";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data, isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();
  const products = data?.items ?? [];
  const filtered = products.filter((p) => p.name.includes(search) || (p.barcode ?? "").includes(search));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">المنتجات</h1><Button variant="primary" size="md" className="flex items-center gap-2" onClick={() => { setEditId(null); setModalOpen(true); }}><Plus size={16} />منتج جديد</Button></div>
      <div className="relative mb-4 w-72"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-sesame-100/40" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو الباركود..." className="w-full rounded-lg bg-char-900 border border-char-800 py-2 pr-9 pl-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400" /></div>
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sesame-100/40" /></div>}
      {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل المنتجات</p>}
      {!isLoading && !isError && (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-card border border-char-800 bg-char-900 p-4">
              <Package className="text-sesame-100/40" size={20} />
              <div className="flex-1"><p className="font-semibold">{p.name} {p.nameEn && <span className="text-xs text-sesame-100/50">({p.nameEn})</span>}</p><p className="text-xs text-sesame-100/50">SKU: {p.sku} · سعر البيع: {Number(p.sellPrice).toLocaleString()} ج.م</p></div>
              <Button variant="ghost" size="sm" onClick={() => { setEditId(p.id); setModalOpen(true); }}>تعديل</Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm("حذف المنتج؟")) deleteProduct.mutate(p.id); }} className="text-chili-500">حذف</Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sesame-100/40">مفيش منتجات لسه</p>}
        </div>
      )}
      <ProductFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editProductId={editId} />
    </div>
  );
}