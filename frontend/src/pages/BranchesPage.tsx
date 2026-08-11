import { useState, FormEvent } from "react";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useBranches, useCreateBranch } from "@/hooks/useBranches";
import { ApiError } from "@/lib/apiClient";

function BranchFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createBranch = useCreateBranch();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!name.trim()) { setError("اسم الفرع مطلوب"); return; }
    try { await createBranch.mutateAsync({ name: name.trim(), address: address.trim() || undefined }); setName(""); setAddress(""); onClose(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "حصل خطأ"); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="فرع جديد">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div><label className="mb-1 block text-xs text-sesame-100/50">اسم الفرع *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400" /></div>
        <div><label className="mb-1 block text-xs text-sesame-100/50">العنوان</label><input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400" /></div>
        {error && <p className="text-sm text-chili-500">{error}</p>}
        <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button><Button type="submit" variant="primary" disabled={createBranch.isPending}>{createBranch.isPending ? "جاري الحفظ..." : "إضافة الفرع"}</Button></div>
      </form>
    </Modal>
  );
}

export default function BranchesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: branches, isLoading, isError } = useBranches();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">الفروع</h1><Button variant="primary" size="md" className="flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={16} />فرع جديد</Button></div>
      {isLoading && <div className="flex justify-center py-16 text-sesame-100/40"><Loader2 className="animate-spin" /></div>}
      {isError && <p className="rounded-card border border-chili-500/30 bg-chili-500/10 p-4 text-sm text-chili-500">تعذر تحميل الفروع</p>}
      {!isLoading && !isError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(branches ?? []).map((b) => <div key={b.id} className="rounded-card border border-char-800 bg-char-900 p-4"><p className="font-semibold">{b.name}</p>{b.address && <p className="mt-1 flex items-center gap-1 text-xs text-sesame-100/50"><MapPin size={12} />{b.address}</p>}<p className="mt-2 text-xs text-sesame-100/40">{b.warehouses.length} مخزن</p></div>)}
          {(branches ?? []).length === 0 && <p className="col-span-full py-10 text-center text-sesame-100/40">مفيش فروع لسه</p>}
        </div>
      )}
      <BranchFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}