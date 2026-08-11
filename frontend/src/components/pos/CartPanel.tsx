import { Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function CartPanel({ onCheckout, isSaving }: { onCheckout: (payments: { method: string; amount: number }[]) => void; isSaving: boolean }) {
  const { items, addItem, removeItem, clearCart, totalQuantity } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;

  function handlePay() {
    const amt = Number(paymentAmount) || total;
    onCheckout([{ method: "CASH", amount: amt }]);
    setShowPayment(false);
    setPaymentAmount("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-char-800 px-4 py-3"><h2 className="font-display text-lg">الطلبات</h2><span className="flex h-7 w-7 items-center justify-center rounded-full bg-flame-500/20 text-xs font-bold text-flame-400">{totalQuantity}</span></div>
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? <p className="py-10 text-center text-sm text-sesame-100/40">السلة فاضية</p> : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 rounded-lg bg-char-950 p-3">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-sesame-100/50">{item.price.toFixed(1)} × {item.quantity}</p></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => removeItem(item.productId)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-char-800"><Minus size={14} /></button>
                  <span className="w-6 text-center font-display text-sm">{item.quantity}</span>
                  <button onClick={() => addItem(item)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-char-800"><Plus size={14} /></button>
                  <button onClick={() => { for (let i = 0; i < item.quantity; i++) removeItem(item.productId); }} className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-chili-500 hover:bg-char-800"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {items.length > 0 && (
        <div className="border-t border-char-800 p-4">
          <div className="mb-3 flex justify-between"><span className="text-sm">الإجمالي</span><span className="font-display text-xl text-flame-400">{total.toLocaleString()} ج.م</span></div>
          {showPayment ? (
            <div className="space-y-2">
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={`المبلغ المدفوع (${total} ج.م)`} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" />
              <div className="flex gap-2"><Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowPayment(false)}>إلغاء</Button><Button variant="primary" size="sm" className="flex-1" onClick={handlePay} disabled={isSaving}>{isSaving ? "جاري..." : "تأكيد الدفع"}</Button></div>
            </div>
          ) : (
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2" onClick={() => setShowPayment(true)}><CreditCard size={18} />دفع</Button>
          )}
        </div>
      )}
    </div>
  );
}
