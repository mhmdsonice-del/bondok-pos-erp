import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { useEmployees } from "@/hooks/useEmployees";

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: "مدير عام", ADMIN: "مدير عام", BRANCH_MANAGER: "مدير فرع", CASHIER: "كاشير", KITCHEN: "مطبخ", ACCOUNTANT: "محاسب", INVENTORY_CLERK: "مسؤول مخزون" };

export default function EmployeesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: employees, isLoading, isError } = useEmployees();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><h1 className="font-display text-2xl tracking-wide">الموظفين</h1><Button variant="primary" size="md" className="flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={16} />إضافة موظف</Button></div>
      {isLoading && <Loader2 className="mx-auto animate-spin" />}
      {isError && <p className="text-sm text-chili-500">تعذر تحميل الموظفين</p>}
      {!isLoading && !isError && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(employees ?? []).map((e) => <div key={e.id} className="rounded-card border border-char-800 bg-char-900 p-4"><p className="font-semibold">{e.fullName}</p><p className="text-xs text-sesame-100/50">{ROLE_LABELS[e.role] ?? e.role} · @{e.username}</p></div>)}{(employees ?? []).length === 0 && <p className="col-span-full py-10 text-center text-sesame-100/40">مفيش موظفين</p>}</div>}
      <EmployeeFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}