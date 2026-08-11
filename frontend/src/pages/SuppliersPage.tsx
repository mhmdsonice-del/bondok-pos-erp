import { useState } from "react";
import { Plus, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SupplierFormModal } from "@/components/suppliers/SupplierFormModal";
import { useSuppliers } from "@/hooks/useSuppliers";

export default function SuppliersPage() {
  const { data: suppliers, isLoading, isError } = useSuppliers();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">الموردين</h1><Button variant="primary" size="md" className="flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={16} />مورد جديد</Button></div>
      {isLoading && <div className="flex justify-center py-16 text-sesame-100/40"><Loader2 className="animate-spin" /></div>}
      {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل الموردين</p>}
      {!isLoading && !isError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(suppliers ?? []).map((s) => (
            <div key={s.id} className="rounded-card border border-char-800 bg-char-900 p-4">
              <div className="flex items-center gap-3"><Truck size={18} className="text-sesame-100/50" /><p className="font-semibold">{s.name}</p></div>
              {s.phone && <p className="mt-2 text-xs text-sesame-100/50">{s.phone}</p>}
              <p className="mt-1 text-xs text-sesame-100/40">الرصيد: {Number(s.balance).toLocaleString()} ج.م</p>
            </div>
          ))}
          {(suppliers ?? []).length === 0 && <p className="col-span-full py-10 text-center text-sesame-100/40">مفيش موردين لسه</p>}
        </div>
      )}
      <SupplierFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}