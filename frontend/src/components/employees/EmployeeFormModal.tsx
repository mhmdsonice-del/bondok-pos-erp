import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCreateEmployee } from "@/hooks/useEmployees";
import { useBranches } from "@/hooks/useBranches";
import { ApiError } from "@/lib/apiClient";

const ROLES = ["CASHIER", "BRANCH_MANAGER", "KITCHEN", "ACCOUNTANT", "INVENTORY_CLERK"] as const;

export function EmployeeFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("CASHIER");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const createEmployee = useCreateEmployee();
  const { data: branches } = useBranches();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!fullName.trim() || !username.trim() || !password) { setError("كل الحقول المطلوبة لازم تملأها"); return; }
    try { await createEmployee.mutateAsync({ fullName: fullName.trim(), username: username.trim(), password, role, branchIds: selectedBranchIds.length > 0 ? selectedBranchIds : (branches ?? []).slice(0, 1).map((b) => b.id) }); onClose(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "حصل خطأ"); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موظف">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div><label className="text-xs text-sesame-100/50">الاسم الكامل *</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">اسم المستخدم *</label><input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">كلمة المرور *</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">الدور</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none mt-1">{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className="text-xs text-sesame-100/50">الفروع</label><div className="mt-1 flex flex-col gap-1">{(branches ?? []).map((b) => <label key={b.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedBranchIds.includes(b.id)} onChange={() => setSelectedBranchIds((prev) => prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id])} />{b.name}</label>)}</div></div>
        {error && <p className="text-sm text-chili-500">{error}</p>}
        <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button><Button type="submit" variant="primary" disabled={createEmployee.isPending}>{createEmployee.isPending ? "جاري..." : "حفظ"}</Button></div>
      </form>
    </Modal>
  );
}
