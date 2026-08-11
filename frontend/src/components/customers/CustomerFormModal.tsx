import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { ApiError } from "@/lib/apiClient";

export function CustomerFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createCustomer = useCreateCustomer();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!name.trim()) { setError("الاسم مطلوب"); return; }
    try { await createCustomer.mutateAsync({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, creditLimit: creditLimit ? Number(creditLimit) : undefined }); setName(""); setPhone(""); setEmail(""); setCreditLimit(""); onClose(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "حصل خطأ"); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="عميل جديد">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div><label className="text-xs text-sesame-100/50">الاسم *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">رقم التليفون</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">الإيميل</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">حد الائتمان</label><input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        {error && <p className="text-sm text-chili-500">{error}</p>}
        <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button><Button type="submit" variant="primary" disabled={createCustomer.isPending}>{createCustomer.isPending ? "جاري..." : "حفظ"}</Button></div>
      </form>
    </Modal>
  );
}
