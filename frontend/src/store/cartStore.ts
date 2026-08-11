import { create } from "zustand";
import { CartLine, Product, ProductVariant, ProductModifier } from "@/types/pos";

interface CartState {
  items: { productId: string; name: string; price: number; sku: string; quantity: number; notes?: string }[];
  totalQuantity: number;
  addItem: (input: { productId: string; name: string; price: number; sku: string; notes?: string }) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  get totalQuantity() { return get().items.reduce((s, i) => s + i.quantity, 0); },
  addItem: (input) => set((state) => {
    const existing = state.items.find((i) => i.productId === input.productId);
    if (existing) return { items: state.items.map((i) => i.productId === input.productId ? { ...i, quantity: i.quantity + 1 } : i) };
    return { items: [...state.items, { ...input, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.map((i) => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0)
  })),
  clearCart: () => set({ items: [] }),
}));
