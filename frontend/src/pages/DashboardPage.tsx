import { useMemo } from "react";
import { DollarSign, Receipt, TrendingUp, AlertTriangle, Flame } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboardSummary, useDailySales, useTopProducts, useSmartAlerts } from "@/hooks/useDashboard";
import { useActiveBranch } from "@/lib/activeContext";

export default function DashboardPage() {
  const { branchId } = useActiveBranch();
  const range = useMemo(() => { if (!branchId) return null; const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(); end.setHours(23, 59, 59, 999); return { branchId, start: start.toISOString(), end: end.toISOString() }; }, [branchId]);
  const weekRange = useMemo(() => { if (!branchId) return null; const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); return { branchId, start: start.toISOString(), end: end.toISOString() }; }, [branchId]);
  const summary = useDashboardSummary(range); const dailySales = useDailySales(weekRange); const topProducts = useTopProducts(range); const alerts = useSmartAlerts(branchId ?? "");
  if (!branchId) return <div className="flex h-64 items-center justify-center"><p className="text-sesame-100/60">الرجاء اختيار الفرع لعرض لوحة التحكم</p></div>;
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><div><h1 className="font-display text-2xl tracking-wide">لوحة التحكم</h1><p className="text-sm text-sesame-100/50">اليوم</p></div>{summary.isError && <span className="rounded-full bg-chili-500/15 px-3 py-1 text-xs text-chili-500">تعذر الاتصال بالـ Backend</span>}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المبيعات" value={summary.data ? `${summary.data.totalSales.toLocaleString()} ج.م` : "—"} icon={DollarSign} />
        <StatCard label="عدد الفواتير" value={summary.data ? String(summary.data.invoiceCount) : "—"} icon={Receipt} />
        <StatCard label="متوسط الفاتورة" value={summary.data ? `${summary.data.averageInvoice.toFixed(1)} ج.م` : "—"} icon={TrendingUp} />
        <StatCard label="صافي الربح التقريبي" value={summary.data ? `${summary.data.grossProfit.toLocaleString()} ج.م` : "—"} icon={Flame} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-char-800 bg-char-900 p-5 lg:col-span-2"><h2 className="mb-4 font-display text-lg tracking-wide">مبيعات آخر 7 أيام</h2><ResponsiveContainer width="100%" height={260}><AreaChart data={dailySales.data ?? []}><defs><linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5791E" stopOpacity={0.5} /><stop offset="95%" stopColor="#F5791E" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#242220" vertical={false} /><XAxis dataKey="date" stroke="#F3EEE480" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#F3EEE480" fontSize={12} tickLine={false} axisLine={false} width={40} /><Tooltip contentStyle={{ background: "#161514", border: "1px solid #242220", borderRadius: 10 }} labelStyle={{ color: "#FBF8F3" }} /><Area type="monotone" dataKey="total" stroke="#F5791E" strokeWidth={2} fill="url(#flameGradient)" /></AreaChart></ResponsiveContainer></div>
        <div className="rounded-card border border-char-800 bg-char-900 p-5"><h2 className="mb-4 flex items-center gap-2 font-display text-lg tracking-wide"><AlertTriangle size={18} className="text-ember-500" />تنبيهات ذكية</h2><ul className="flex flex-col gap-3">{(alerts.data ?? []).map((alert, i) => <li key={i} className="rounded-lg bg-char-950/60 p-3 text-sm"><span className={alert.type === "LOW_STOCK" ? "text-flame-400" : "text-chili-500"}>{alert.type === "LOW_STOCK" ? "● نقص مخزون" : "● قرب انتهاء صلاحية"}</span><p className="mt-1 text-sesame-100/70">{alert.message}</p></li>)}{alerts.data?.length === 0 && <p className="text-sm text-sesame-100/40">مفيش تنبيهات حاليًا 🎉</p>}</ul></div>
      </div>
      <div className="mt-6 rounded-card border border-char-800 bg-char-900 p-5"><h2 className="mb-4 font-display text-lg tracking-wide">أفضل الأصناف مبيعًا</h2><ul className="flex flex-col gap-3">{(topProducts.data ?? []).map((p, i) => { const max = topProducts.data?.[0]?.quantitySold ?? 1; return <li key={i} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-char-800 text-xs font-bold text-sesame-100/60">{i + 1}</span><span className="flex-1 text-sm">{p.product?.name}</span><div className="h-2 w-40 overflow-hidden rounded-full bg-char-800"><div className="h-full rounded-full bg-gradient-to-l from-flame-400 to-flame-600" style={{ width: `${(p.quantitySold / max) * 100}%` }} /></div><span className="w-10 text-right text-sm text-sesame-100/60">{p.quantitySold}</span></li>; })}</ul></div>
    </div>
  );
}