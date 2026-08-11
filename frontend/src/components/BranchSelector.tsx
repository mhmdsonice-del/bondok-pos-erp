import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Store } from "lucide-react";
import { clsx } from "clsx";
import { useActiveBranch } from "@/lib/activeContext";

export function BranchSelector() {
  const { branchId, setActiveBranch, branches, hasMultipleBranches } = useActiveBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick); }, []);
  const activeBranch = branches.find((b) => b.id === branchId);
  if (!hasMultipleBranches && branches.length <= 1) return <div className="flex items-center gap-2 px-3 py-2 text-sm text-sesame-100/60"><Store size={14} /><span>{activeBranch?.name ?? "الفرع"}</span></div>;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={clsx("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", "text-flame-400 bg-flame-500/10 hover:bg-flame-500/20")}><Building2 size={16} /><span className="flex-1 text-right truncate">{activeBranch?.name ?? "اختر الفرع"}</span><ChevronDown size={14} className={clsx("transition-transform", open && "rotate-180")} /></button>
      {open && <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-[180px] rounded-lg border border-char-700 bg-char-900 py-1 shadow-xl"><p className="px-3 py-1.5 text-xs text-sesame-100/40">الفروع المتاحة</p>{branches.map((b) => <button key={b.id} onClick={() => { setActiveBranch(b.id, b.warehouseId); setOpen(false); }} className={clsx("flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-right", b.id === branchId ? "bg-flame-500/10 text-flame-400" : "text-sesame-100/70 hover:bg-char-800")}><Store size={14} /><span className="flex-1">{b.name}</span></button>)}</div>}
    </div>
  );
}
