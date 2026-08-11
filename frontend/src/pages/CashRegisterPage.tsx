import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCurrentRegister, useOpenRegister, useRecordCashMovement, useCloseRegister } from "@/hooks/useCashRegister";

function AmountPromptModal({ isOpen, onClose, title, onSubmit, isSaving }: { isOpen: boolean; onClose: () => void; title: string; onSubmit: (amount: number, notes?: string) => void; isSaving: boolean }) {
  const [amount, setAmount] = useState(""); const [notes, setNotes] = useState("");
  return <Modal isOpen={isOpen} onClose={onClose} title={title}><div className="flex flex-col gap-3"><input type="number" min={0} step="0.01" placeholder="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" /><input placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" /><Button variant="primary" disabled={isSaving || !amount} onClick={() => onSubmit(Number(amount), notes || undefined)}>{isSaving ? "جاري..." : "تأكيد"}</Button></div></Modal>;
}

export default function CashRegisterPage() {
  const { data: register, isLoading, isError } = useCurrentRegister();
  const openRegister = useOpenRegister(); const recordMovement = useRecordCashMovement(); const closeRegister = useCloseRegister();
  const [activeModal, setActiveModal] = useState<"open"|"receipt"|"payment"|"close"|null>(null);
  const movements = register?.movements ?? [];
  const receipts = movements.filter((m) => m.type === "RECEIPT").reduce((s, m) => s + m.amount, 0);
  const payments = movements.filter((m) => m.type === "PAYMENT").reduce((s, m) => s + m.amount, 0);
  const expected = (register?.openingAmount ?? 0) + receipts - payments;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">الخزنة</h1>{register ? <div className="flex gap-2"><Button variant="secondary" size="md" onClick={() => setActiveModal("receipt")}><ArrowDownCircle size={16} className="text-emerald-400" />قبض</Button><Button variant="secondary" size="md" onClick={() => setActiveModal("payment")}><ArrowUpCircle size={16} className="text-chili-500" />صرف</Button><Button variant="primary" size="md" onClick={() => setActiveModal("close")}><LockKeyhole size={16} />إقفال</Button></div> : !isLoading && <Button variant="primary" size="md" onClick={() => setActiveModal("open")}>فتح الخزنة</Button>}</div>
      {isLoading && <Loader2 className="mx-auto animate-spin" />}
      {isError && <p className="text-sm text-chili-500">تعذر تحميل الخزنة</p>}
      {register && <>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-card border border-char-800 bg-char-900 p-4"><p className="text-xs text-sesame-100/50">رصيد الافتتاح</p><p className="mt-1 font-display text-xl">{register.openingAmount.toLocaleString()} ج.م</p></div>
          <div className="rounded-card border border-char-800 bg-char-900 p-4"><p className="text-xs text-sesame-100/50">إجمالي القبض</p><p className="mt-1 font-display text-xl text-emerald-400">{receipts.toLocaleString()} ج.م</p></div>
          <div className="rounded-card border border-char-800 bg-char-900 p-4"><p className="text-xs text-sesame-100/50">إجمالي الصرف</p><p className="mt-1 font-display text-xl text-chili-500">{payments.toLocaleString()} ج.م</p></div>
          <div className="rounded-card border border-flame-500/40 bg-char-900 p-4"><p className="text-xs text-sesame-100/50">الرصيد المتوقع</p><p className="mt-1 font-display text-xl text-flame-400">{expected.toLocaleString()} ج.م</p></div>
        </div>
        <div className="overflow-hidden rounded-card border border-char-800"><table className="w-full text-sm"><thead className="bg-char-900"><tr><th className="px-4 py-3">النوع</th><th className="px-4 py-3">البيان</th><th className="px-4 py-3">المبلغ</th></tr></thead><tbody>{movements.map((m) => <tr key={m.id} className="border-t border-char-800 bg-char-950"><td className="px-4 py-3">{m.type === "RECEIPT"?<span className="text-emerald-400">قبض</span>:<span className="text-chili-500">صرف</span>}</td><td className="px-4 py-3">{m.notes??"—"}</td><td className="px-4 py-3 font-display">{m.amount.toLocaleString()} ج.م</td></tr>)}</tbody></table></div>
      </>}
      {["open","receipt","payment","close"].map((t) => <AmountPromptModal key={t} isOpen={activeModal === t} onClose={() => setActiveModal(null)} title={t==="open"?"رصيد البداية":t==="receipt"?"تسجيل قبض":t==="payment"?"تسجيل صرف":"إقفال يومي"} isSaving={t==="open"?openRegister.isPending:t==="close"?closeRegister.isPending:recordMovement.isPending} onSubmit={(amount,notes)=>{if(t==="open")openRegister.mutate(amount,{onSuccess:()=>setActiveModal(null)});else if(t==="close"&&register)closeRegister.mutate({id:register.id,actualClosingAmount:amount},{onSuccess:()=>setActiveModal(null)});else if(register)recordMovement.mutate({cashRegisterId:register.id,type:t==="receipt"?"RECEIPT":"PAYMENT",amount,notes},{onSuccess:()=>setActiveModal(null)});}} />)}
    </div>
  );
}