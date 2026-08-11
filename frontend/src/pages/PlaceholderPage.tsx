import { Wrench } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Wrench className="text-sesame-100/30" size={40} />
      <p className="text-sesame-100/50">{title} — قيد التطوير</p>
    </div>
  );
}