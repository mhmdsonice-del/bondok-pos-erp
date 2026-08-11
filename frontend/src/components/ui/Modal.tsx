import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => { if (!isOpen) return; const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [isOpen, onClose]);
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-char-800 bg-char-900 p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg tracking-wide text-sesame-50">{title}</h2><button onClick={onClose} className="text-sesame-100/40 hover:text-sesame-50"><X size={18} /></button></div>
        {children}
      </div>
    </div>, document.body);
}
