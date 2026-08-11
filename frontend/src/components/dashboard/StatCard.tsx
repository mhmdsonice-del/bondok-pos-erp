import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-card border border-char-800 bg-char-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-sesame-100/50">{label}</p>
        <Icon className="text-flame-400" size={18} />
      </div>
      <p className="font-display text-2xl tracking-wide">{value}</p>
    </div>
  );
}
