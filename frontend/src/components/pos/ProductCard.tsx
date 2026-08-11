import { Plus, Minus } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { Product } from "@/types/pos";

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCartStore();
  const cartItem: CartItem | undefined = items.find((i) => i.productId === product.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="relative flex flex-col rounded-card border border-char-800 bg-char-900 p-3 transition-shadow hover:shadow-md">
      <div className="flex-1">
        <p className="text-sm font-medium leading-tight">{product.name}</p>
        <p className="mt-0.5 text-xs text-sesame-100/50">SKU: {product.sku}</p>
        <p className="mt-2 font-display text-lg text-flame-400">{Number(product.sellPrice).toLocaleString()} ج.م</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {qty === 0 ? (
          <button onClick={() => addItem({ productId: product.id, name: product.name, price: Number(product.sellPrice), sku: product.sku })} className="flex-1 rounded-lg bg-flame-500 py-1.5 text-xs font-bold text-white transition hover:bg-flame-600">إضافة</button>
        ) : (
          <div className="flex w-full items-center justify-between rounded-lg bg-char-950 px-2 py-1">
            <button onClick={() => removeItem(product.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-char-800"><Minus size={14} /></button>
            <span className="font-display text-sm">{qty}</span>
            <button onClick={() => addItem({ productId: product.id, name: product.name, price: Number(product.sellPrice), sku: product.sku })} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-char-800"><Plus size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
