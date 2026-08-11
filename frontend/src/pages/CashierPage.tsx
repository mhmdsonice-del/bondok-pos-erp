import { useMemo, useState } from "react";
import { Search, CreditCard, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartPanel } from "@/components/pos/CartPanel";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { useActiveBranch } from "@/lib/activeContext";

export default function CashierPage() {
  const { branchId } = useActiveBranch();
  const [search, setSearch] = useState("");
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const { data, isLoading, isError } = useProducts();
  const createOrder = useCreateOrder();
  const { items, clearCart, totalQuantity } = useCartStore();

  const products = data?.items ?? [];
  const filtered = products.filter((p) => p.name.includes(search) || (p.barcode ?? "").includes(search));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;

  async function handleCheckout(payments: { method: string; amount: number }[]) {
    if (!branchId) return;
    try {
      const order = await createOrder.mutateAsync({
        branchId,
        type: "DINE_IN",
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, notes: i.notes ?? undefined })),
      });
      setReceiptOrder({ ...order, items, subtotal, total });
      clearCart();
    } catch { /* handled by mutation */ }
  }

  if (!branchId) return <div className="flex h-64 items-center justify-center"><p className="text-sesame-100/60">الرجاء اختيار الفرع</p></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-4 p-4">
          <div className="relative flex-1 max-w-sm"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-sesame-100/40" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو امسح الباركود..." className="w-full rounded-lg bg-char-900 border border-char-800 py-2.5 pr-9 pl-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400" /></div>
          <div className="flex items-center gap-2 rounded-full bg-flame-500/15 px-4 py-1.5 text-sm font-medium text-flame-400"><CreditCard size={16} />{totalQuantity} منتج</div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sesame-100/40" /></div>}
          {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل المنتجات</p>}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <div className="w-full shrink-0 border-t border-char-800 lg:w-96 lg:border-r-0 lg:border-l"><CartPanel onCheckout={handleCheckout} isSaving={createOrder.isPending} /></div>
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
    </div>
  );
}