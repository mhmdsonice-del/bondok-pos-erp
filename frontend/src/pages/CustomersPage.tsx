import { useState } from "react";
import { Search, Plus, Star, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { data: customers, isLoading, isError } = useCustomers();
  const filtered = (customers ?? []).filter((c) => c.name.includes(search) || (c.phone ?? "").includes(search));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">العملاء</h1><Button variant="primary" size="md" className="flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={16} />عميل جديد</Button></div>
      <div className="relative mb-4 w-72"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-sesame-100/40" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو التليفون..." className="w-full rounded-lg bg-char-900 border border-char-800 py-2 pr-9 pl-3 text-sm outline-none" /></div>
      {isLoading && <Loader2 className="mx-auto animate-spin" />}
      {isError && <p className="text-sm text-chili-500">تعذر تحميل العملاء</p>}
      {!isLoading && !isError && <div className="grid gap-3">{filtered.map((c) => <div key={c.id} className="flex items-center gap-4 rounded-card border border-char-800 bg-char-900 p-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-flame-500/15 font-display text-flame-400">{c.name.charAt(0)}</div><div className="flex-1"><p className="font-semibold">{c.name}</p><p className="text-xs text-sesame-100/50">{c.phone ?? "—"}</p></div><div className="flex items-center gap-1 text-sm text-ember-500"><Star size={14} />{c.loyaltyPoints} نقطة</div></div>)}{filtered.length === 0 && <p className="py-10 text-center text-sesame-100/40">مفيش عملاء لسه</p>}</div>}
      <CustomerFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}