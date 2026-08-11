import { useState, useEffect, FormEvent } from "react";
import { Save, Percent, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettings, useTaxes, useCreateTax, useUpdateSettings } from "@/hooks/useSettings";
import { ApiError } from "@/lib/apiClient";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { data: taxes } = useTaxes();
  const createTax = useCreateTax();
  const updateSettings = useUpdateSettings();

  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currency, setCurrency] = useState("");
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("");

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.name ?? "");
      setTaxNumber(settings.taxNumber ?? "");
      setCurrency(settings.currency ?? "");
    }
  }, [settings]);

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    try { await updateSettings.mutateAsync({ name: companyName, taxNumber, currency }); } catch {}
  }

  async function handleAddTax(e: FormEvent) {
    e.preventDefault();
    if (!newTaxName || !newTaxRate) return;
    try {
      await createTax.mutateAsync({ name: newTaxName, rate: Number(newTaxRate) });
      setNewTaxName(""); setNewTaxRate("");
    } catch {}
  }

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-sesame-100/40" /></div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-2xl tracking-wide mb-6">الإعدادات</h1>
      <form onSubmit={handleSaveSettings} className="rounded-card border border-char-800 bg-char-900 p-5 mb-6 space-y-4">
        <h2 className="font-display text-lg">بيانات الشركة</h2>
        <div><label className="text-xs text-sesame-100/50">اسم الشركة</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400 mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">الرقم الضريبي</label><input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400 mt-1" /></div>
        <div><label className="text-xs text-sesame-100/50">العملة</label><input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-flame-400 mt-1" /></div>
        <Button type="submit" variant="primary" disabled={updateSettings.isPending}><Save size={16} className="ml-1" />حفظ الإعدادات</Button>
        {updateSettings.isError && <p className="text-sm text-chili-500">{(updateSettings.error as any)?.message ?? "حصل خطأ"}</p>}
      </form>
      <div className="rounded-card border border-char-800 bg-char-900 p-5">
        <h2 className="font-display text-lg mb-4">الضرائب</h2>
        <ul className="flex flex-col gap-2 mb-4">{(taxes ?? []).map((t) => <li key={t.id} className="flex items-center gap-2 rounded-lg bg-char-950 p-3 text-sm"><Percent size={14} className="text-flame-400" />{t.name}: {Number(t.rate)}%</li>)}</ul>
        <form onSubmit={handleAddTax} className="flex gap-2">
          <input value={newTaxName} onChange={(e) => setNewTaxName(e.target.value)} placeholder="اسم الضريبة" className="flex-1 rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" />
          <input type="number" value={newTaxRate} onChange={(e) => setNewTaxRate(e.target.value)} placeholder="%" className="w-24 rounded-lg bg-char-950 border border-char-800 px-3 py-2.5 text-sm outline-none" />
          <Button type="submit" variant="secondary" disabled={createTax.isPending}>إضافة</Button>
        </form>
      </div>
    </div>
  );
}