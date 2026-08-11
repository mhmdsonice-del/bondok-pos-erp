export interface Product { id: string; name: string; nameEn?: string; sku: string; barcode?: string; imageUrl?: string; sellPrice: number; categoryId?: string; isSpicy?: boolean; isNew?: boolean; variants: ProductVariant[]; modifiers: ProductModifier[] }
export interface ProductVariant { id: string; name: string; priceDelta: number }
export interface ProductModifier { id: string; name: string; price: number }
export interface CartLine { lineId: string; product: Product; variant?: ProductVariant; modifiers: ProductModifier[]; quantity: number; notes?: string; unitPrice: number }
export interface Category { id: string; name: string }
export type OrderType = "DINE_IN"|"TAKEAWAY"|"DELIVERY"|"PICKUP";
export type PaymentMethod = "CASH"|"VISA"|"WALLET"|"MIXED";
