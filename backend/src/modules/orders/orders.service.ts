import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";
import type { OrderType, PaymentMethod, Prisma } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  discount?: number;
  notes?: string;
  variantId?: string;
  selectedModifiers?: { modifierId: string; name: string; price: number }[];
}

interface CreateOrderInput {
  branchId: string;
  createdById: string;
  companyId: string;
  type: OrderType;
  items: CreateOrderItemInput[];
  couponCode?: string;
  customerId?: string;
  taxRatePercent?: number;
  serviceChargePercent?: number;
  clientTransactionId?: string;
}

interface CompleteOrderPaymentInput {
  method: PaymentMethod;
  amount: number;
}

// ============================================================
// HELPERS
// ============================================================

async function generateOrderNumber(branchId: string, tx?: Prisma.TransactionClient): Promise<string> {
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  if (tx) {
    // Already inside a transaction — use tx directly
    const existing = await tx.orderCounter.findUnique({ where: { branchId_dateKey: { branchId, dateKey } } });
    if (existing) {
      const updated = await tx.orderCounter.update({
        where: { branchId_dateKey: { branchId, dateKey } },
        data: { counter: { increment: 1 } },
      });
      return `BR-${dateKey}-${String(updated.counter).padStart(6, "0")}`;
    }
    const created = await tx.orderCounter.create({ data: { branchId, dateKey, counter: 1 } });
    return `BR-${dateKey}-${String(created.counter).padStart(6, "0")}`;
  }
  // Not inside a transaction — wrap in one for atomicity
  return (prisma as any).$transaction(async (innerTx: any) => {
    const existing = await innerTx.orderCounter.findUnique({ where: { branchId_dateKey: { branchId, dateKey } } });
    if (existing) {
      const updated = await innerTx.orderCounter.update({
        where: { branchId_dateKey: { branchId, dateKey } },
        data: { counter: { increment: 1 } },
      });
      return `BR-${dateKey}-${String(updated.counter).padStart(6, "0")}`;
    }
    const created = await innerTx.orderCounter.create({ data: { branchId, dateKey, counter: 1 } });
    return `BR-${dateKey}-${String(created.counter).padStart(6, "0")}`;
  });
}

async function validateBranch(branchId: string, companyId: string, tx?: Prisma.TransactionClient) {
  const db = tx ?? prisma;
  const branch = await db.branch.findFirst({ where: { id: branchId, companyId } });
  if (!branch) throw new AppError("Branch not found or access denied", 404);
  return branch;
}

async function fetchValidatedProducts(productIds: string[], companyId: string, tx?: Prisma.TransactionClient) {
  const db = tx ?? prisma;
  const products = await db.product.findMany({
    where: { id: { in: productIds }, companyId, isActive: true },
    include: { variants: { where: { isActive: true } }, modifiers: { where: { isActive: true } } },
  });
  if (products.length !== new Set(productIds).size) throw new AppError("One or more products not found or inactive", 400);
  return new Map(products.map((p) => [p.id, p]));
}

function validatePayments(payments: CompleteOrderPaymentInput[], totalAmount: number) {
  if (!payments.length) throw new AppError("At least one payment is required", 400);
  const totalPaid = payments.reduce((sum, p) => {
    if (p.amount <= 0) throw new AppError("Payment amount must be positive", 400);
    return sum + p.amount;
  }, 0);
  const diff = Math.abs(totalPaid - totalAmount);
  if (diff > 0.01) throw new AppError(`Payment total (${totalPaid.toFixed(2)}) does not match order total (${totalAmount.toFixed(2)})`, 400);
  return totalPaid;
}

// ============================================================
// CREATE ORDER
// ============================================================

export async function createOrderService(input: CreateOrderInput) {
  if (input.items.length === 0) throw new AppError("Order must contain at least one item", 400);

  // Dedup check for offline sync
  if (input.clientTransactionId) {
    const existing = await prisma.order.findUnique({ where: { clientTransactionId: input.clientTransactionId } });
    if (existing) return existing;
  }

  await validateBranch(input.branchId, input.companyId);
  const productIds = input.items.map((i) => i.productId);
  const productMap = await fetchValidatedProducts(productIds, input.companyId);

  // Coupon validation
  let couponDiscount = 0;
  let couponId: string | undefined;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
    if (!coupon || coupon.isUsed || (coupon.expiryDate && coupon.expiryDate < new Date()))
      throw new AppError("Invalid or expired coupon", 400);
    couponId = coupon.id;
    couponDiscount = coupon.discountType === "PERCENT" ? 0 : Number(coupon.value);
  }

  const taxRate = input.taxRatePercent ?? 0;
  const serviceRate = input.serviceChargePercent ?? 0;

  // Calculate totals with server-side prices only
  let subtotal = 0;
  let itemDiscountTotal = 0;
  let modifierTotalAll = 0;

  const orderItemsData = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.sellPrice);

    // Validate variant
    let variantPriceDelta = 0;
    if (item.variantId) {
      const variant = product.variants?.find((v: any) => v.id === item.variantId);
      if (!variant) throw new AppError(`Variant not found for product ${product.id}`, 400);
      variantPriceDelta = Number(variant.priceDelta);
    }

    // Validate modifiers — use DB prices
    let itemModifierTotal = 0;
    const validatedModifiers: { modifierId: string; name: string; price: number }[] = [];
    if (item.selectedModifiers?.length) {
      for (const mod of item.selectedModifiers) {
        const dbMod = product.modifiers?.find((m: any) => m.id === mod.modifierId);
        if (!dbMod) throw new AppError(`Modifier ${mod.modifierId} not valid for product ${product.id}`, 400);
        const realPrice = Number(dbMod.price);
        itemModifierTotal += realPrice * item.quantity;
        validatedModifiers.push({ modifierId: dbMod.id, name: dbMod.name, price: realPrice });
      }
    }

    const lineTotal = (unitPrice + variantPriceDelta) * item.quantity;
    const discount = item.discount ?? 0;
    subtotal += lineTotal;
    itemDiscountTotal += discount;
    modifierTotalAll += itemModifierTotal;

    return {
      productId: product.id, quantity: item.quantity,
      unitPrice: unitPrice + variantPriceDelta, discount,
      variantId: item.variantId || undefined,
      modifierTotal: itemModifierTotal,
      modifiers: validatedModifiers.length ? validatedModifiers : undefined,
      notes: item.notes,
    };
  });

  const couponPctDisc = input.couponCode && couponId
    ? parseFloat((subtotal * (Number((await prisma.coupon.findUniqueOrThrow({ where: { id: couponId } })).value) / 100)).toFixed(2))
    : couponDiscount;

  const taxableBase = subtotal - itemDiscountTotal - couponPctDisc + modifierTotalAll;
  const taxAmount = parseFloat((taxableBase * (taxRate / 100)).toFixed(2));
  const serviceAmount = parseFloat((taxableBase * (serviceRate / 100)).toFixed(2));
  const totalAmount = parseFloat((taxableBase + taxAmount + serviceAmount).toFixed(2));

  const orderNumber = await generateOrderNumber(input.branchId);
  return prisma.order.create({
    data: {
      branchId: input.branchId, createdById: input.createdById,
      customerId: input.customerId, orderNumber, type: input.type, status: "OPEN",
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat((itemDiscountTotal + couponPctDisc).toFixed(2)),
      taxAmount, serviceAmount, totalAmount, couponId,
      clientTransactionId: input.clientTransactionId,
      items: { create: orderItemsData.map(i => ({
        productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        discount: i.discount, variantId: i.variantId,
        modifierTotal: i.modifierTotal, modifiers: i.modifiers as any, notes: i.notes,
      })) },
    },
    include: { items: true },
  });
}

// ============================================================
// COMPLETE ORDER — ATOMIC TRANSACTION
// ============================================================

export async function completeOrderService(
  orderId: string, payments: CompleteOrderPaymentInput[],
  userId: string, companyId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Load order with all relations
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { include: { variants: true, modifiers: true, recipeItems: { include: { rawMaterial: true } } } } } },
        payments: true, branch: true,
      },
    });
    if (!order) throw new AppError("Order not found", 404);

    // 2. Validate branch belongs to company
    const branch = await tx.branch.findFirst({ where: { id: order.branchId, companyId } });
    if (!branch) throw new AppError("Branch does not belong to your company", 403);

    // 3. Validate order status — prevent double completion
    if (order.status !== "OPEN" && order.status !== "DRAFT")
      throw new AppError(`Cannot complete order with status ${order.status}`, 400);

    // 4. Recalculate ALL prices server-side
    let recalculatedSubtotal = 0;
    let recalculatedDiscount = 0;
    let recalculatedModifierTotal = 0;

    for (const item of order.items) {
      const product = item.product;
      if (!product || !product.isActive) throw new AppError(`Product ${item.productId} is no longer available`, 400);

      const unitPrice = Number(product.sellPrice);
      let variantDelta = 0;
      if (item.variantId) {
        const v = product.variants.find((vr: any) => vr.id === item.variantId);
        if (!v) throw new AppError(`Variant not found for product ${product.id}`, 400);
        variantDelta = Number(v.priceDelta);
      }

      let itemModTotal = 0;
      const mods = item.modifiers as any[] | undefined;
      if (mods?.length) {
        for (const mod of mods) {
          const dbMod = product.modifiers.find((m: any) => m.id === mod.modifierId);
          if (!dbMod || !dbMod.isActive) throw new AppError(`Modifier ${mod.modifierId} not valid for ${product.id}`, 400);
          itemModTotal += Number(dbMod.price) * Number(item.quantity);
        }
      }

      recalculatedSubtotal += (unitPrice + variantDelta) * Number(item.quantity);
      recalculatedDiscount += Number(item.discount);
      recalculatedModifierTotal += itemModTotal;

      await tx.orderItem.update({
        where: { id: item.id },
        data: { unitPrice: unitPrice + variantDelta, modifierTotal: itemModTotal },
      });
    }

    recalculatedSubtotal = parseFloat(recalculatedSubtotal.toFixed(2));
    recalculatedDiscount = parseFloat(recalculatedDiscount.toFixed(2));

    const taxableBase = recalculatedSubtotal - recalculatedDiscount + recalculatedModifierTotal;
    const taxRate = Number(order.subtotal) > 0 ? (Number(order.taxAmount) / (Number(order.subtotal) - Number(order.discountAmount))) * 100 : 0;
    const svcRate = Number(order.subtotal) > 0 ? (Number(order.serviceAmount) / (Number(order.subtotal) - Number(order.discountAmount))) * 100 : 0;
    const recalcTax = parseFloat((taxableBase * (taxRate / 100)).toFixed(2));
    const recalcService = parseFloat((taxableBase * (svcRate / 100)).toFixed(2));
    const recalcTotal = parseFloat((taxableBase + recalcTax + recalcService).toFixed(2));

    // 5. Validate payments
    const totalPaid = validatePayments(payments, recalcTotal);

    // 6. Get open cash register
    const cashRegister = await tx.cashRegister.findFirst({
      where: { branchId: order.branchId, isClosed: false },
    });
    if (!cashRegister) throw new AppError("No open cash register for this branch", 400);

    // 7. Create payments + cash movements
    for (const payment of payments) {
      const created = await tx.payment.create({
        data: { orderId: order.id, method: payment.method, amount: payment.amount },
      });
      const movement = await tx.cashMovement.create({
        data: {
          cashRegisterId: cashRegister.id, userId,
          type: payment.method === "CASH" ? "SALE_RECEIPT" : "RECEIPT",
          amount: payment.amount, orderId: order.id,
          notes: `${payment.method} payment for order ${order.orderNumber}`,
        },
      });
      await tx.payment.update({ where: { id: created.id }, data: { cashMovementId: movement.id } });
    }

    // 8. Deduct inventory with recipe explosion
    const warehouse = await tx.warehouse.findFirst({ where: { branchId: order.branchId, isActive: true } });
    if (!warehouse) throw new AppError("No active warehouse for this branch", 400);

    for (const item of order.items) {
      const recipe = await tx.recipeItem.findMany({ where: { productId: item.productId } });
      const qty = Number(item.quantity);

      if (recipe.length > 0) {
        // Recipe explosion
        for (const ri of recipe) {
          const required = Number(ri.quantity) * qty;
          const stock = await tx.stockLevel.findFirst({
            where: { warehouseId: warehouse.id, productId: ri.rawMaterialId, batchNumber: null },
          });
          if (!stock || Number(stock.quantity) < required) {
            const raw = await tx.product.findUnique({ where: { id: ri.rawMaterialId }, select: { name: true } });
            throw new AppError(`Insufficient stock for "${raw?.name || ri.rawMaterialId}": need ${required}, have ${stock ? Number(stock.quantity) : 0}`, 400);
          }
          await tx.stockLevel.update({ where: { id: stock.id }, data: { quantity: { decrement: required } } });
          await tx.stockMovement.create({
            data: { warehouseId: warehouse.id, productId: ri.rawMaterialId, type: "RECIPE_CONSUMPTION", quantity: required, reference: order.id, notes: `Recipe consumption for ${item.product.name} in ${order.orderNumber}` },
          });
        }
      } else {
        // Direct deduction
        const stock = await tx.stockLevel.findFirst({
          where: { warehouseId: warehouse.id, productId: item.productId, batchNumber: null },
        });
        if (!stock || Number(stock.quantity) < qty) {
          throw new AppError(`Insufficient stock for "${item.product.name}": need ${qty}, have ${stock ? Number(stock.quantity) : 0}`, 400);
        }
        await tx.stockLevel.update({ where: { id: stock.id }, data: { quantity: { decrement: qty } } });
        await tx.stockMovement.create({
          data: { warehouseId: warehouse.id, productId: item.productId, type: "SALE_OUT", quantity: qty, unitCost: item.product.costPrice, reference: order.id, notes: `Sale for ${order.orderNumber}` },
        });
      }
    }

    // 9. Update customer loyalty
    if (order.customerId) {
      const points = Math.floor(recalcTotal / 10);
      await tx.customer.update({ where: { id: order.customerId }, data: { loyaltyPoints: { increment: points } } });
    }

    // 10. Finalize
    const finalized = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED", paymentStatus: "PAID",
        subtotal: recalculatedSubtotal, discountAmount: recalculatedDiscount,
        taxAmount: recalcTax, serviceAmount: recalcService,
        totalAmount: recalcTotal, paidAmount: totalPaid, completedAt: new Date(),
      },
      include: { items: true, payments: true },
    });

    // 11. Audit
    await tx.auditLog.create({
      data: {
        userId, action: "ORDER_COMPLETED", entityType: "Order", entityId: order.id,
        metadata: { orderNumber: order.orderNumber, total: recalcTotal, payments, itemsCount: order.items.length } as any,
      },
    });

    return finalized;
  });
}

// ============================================================
// CANCEL ORDER
// ============================================================

export async function cancelOrderService(orderId: string, reason: string, userId: string, companyId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) throw new AppError("Order not found", 404);
    await tx.branch.findFirstOrThrow({ where: { id: order.branchId, companyId } });
    if (order.status === "CANCELLED") throw new AppError("Order is already cancelled", 400);
    if (order.status === "COMPLETED") throw new AppError("Cannot cancel completed order — use refund instead", 400);

    // Reverse payments
    for (const payment of order.payments) {
      if (payment.isReversed) continue;
      const cr = await tx.cashRegister.findFirst({ where: { branchId: order.branchId, isClosed: false } });
      if (cr) {
        await tx.cashMovement.create({
          data: { cashRegisterId: cr.id, userId, type: "REFUND_PAYOUT", amount: payment.amount, orderId: order.id, notes: `Cancellation reversal for ${order.orderNumber}` },
        });
      }
      await tx.payment.update({
        where: { id: payment.id }, data: { isReversed: true, reversedAt: new Date(), reversalReason: `Order cancelled: ${reason}` },
      });
    }

    const updated = await tx.order.update({
      where: { id: order.id }, data: { status: "CANCELLED", cancelReason: reason, cancelledById: userId, cancelledAt: new Date() },
    });

    await tx.auditLog.create({
      data: { userId, action: "ORDER_CANCELLED", entityType: "Order", entityId: order.id, metadata: { orderNumber: order.orderNumber, reason } } as any,
    });

    return updated;
  });
}

// ============================================================
// REFUND ORDER
// ============================================================

export async function refundOrderService(
  orderId: string,
  input: { type: "FULL" | "PARTIAL"; amount?: number; items?: { orderItemId: string; quantity: number }[]; reason: string },
  userId: string, companyId: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, payments: true, refunds: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    if (order.status !== "COMPLETED") throw new AppError("Only completed orders can be refunded", 400);
    await tx.branch.findFirstOrThrow({ where: { id: order.branchId, companyId } });

    const alreadyRefunded = order.refunds.reduce((s, r) => s + Number(r.amount), 0);
    const refundable = Number(order.paidAmount) - alreadyRefunded;
    if (refundable <= 0) throw new AppError("No refundable amount remaining", 400);

    const refundAmount = input.type === "FULL" ? refundable : (input.amount ?? 0);
    if (refundAmount <= 0) throw new AppError("Refund amount must be positive", 400);
    if (refundAmount > refundable) throw new AppError(`Refund amount ${refundAmount} exceeds refundable ${refundable}`, 400);

    const refund = await tx.refund.create({
      data: { orderId: order.id, type: input.type, amount: refundAmount, reason: input.reason, createdById: userId },
    });

    // Reverse payments
    const cr = await tx.cashRegister.findFirst({ where: { branchId: order.branchId, isClosed: false } });
    let remaining = refundAmount;
    for (const payment of order.payments) {
      if (remaining <= 0) break;
      if (payment.isReversed) continue;
      const rev = Math.min(Number(payment.amount), remaining);
      if (rev <= 0) continue;
      if (cr) {
        await tx.cashMovement.create({
          data: { cashRegisterId: cr.id, userId, type: "REFUND_PAYOUT", amount: rev, orderId: order.id, notes: `Refund: ${input.reason}` },
        });
      }
      const fullyReversed = Number(payment.amount) <= rev;
      await tx.payment.update({
        where: { id: payment.id },
        data: { isReversed: fullyReversed, reversedAt: fullyReversed ? new Date() : undefined, reversalReason: fullyReversed ? `Refund: ${input.reason}` : undefined },
      });
      remaining -= rev;
    }

    // Return inventory
    if (input.items?.length) {
      const wh = await tx.warehouse.findFirst({ where: { branchId: order.branchId, isActive: true } });
      if (wh) {
        for (const ri of input.items) {
          const oi = order.items.find((it) => it.id === ri.orderItemId);
          if (!oi || !oi.product.allowRefund) continue;
          const recipe = await tx.recipeItem.findMany({ where: { productId: oi.productId } });
          if (recipe.length > 0) {
            for (const rcp of recipe) {
              const rqty = Number(rcp.quantity) * ri.quantity;
              const stk = await tx.stockLevel.findFirst({ where: { warehouseId: wh.id, productId: rcp.rawMaterialId, batchNumber: null } });
              if (stk) await tx.stockLevel.update({ where: { id: stk.id }, data: { quantity: { increment: rqty } } });
              else await tx.stockLevel.create({ data: { warehouseId: wh.id, productId: rcp.rawMaterialId, quantity: rqty } });
              await tx.stockMovement.create({
                data: { warehouseId: wh.id, productId: rcp.rawMaterialId, type: "RETURN_IN", quantity: rqty, reference: refund.id, notes: `Refund return for ${order.orderNumber}` },
              });
            }
          } else {
            const stk = await tx.stockLevel.findFirst({ where: { warehouseId: wh.id, productId: oi.productId, batchNumber: null } });
            if (stk) await tx.stockLevel.update({ where: { id: stk.id }, data: { quantity: { increment: ri.quantity } } });
            else await tx.stockLevel.create({ data: { warehouseId: wh.id, productId: oi.productId, quantity: ri.quantity } });
            await tx.stockMovement.create({
              data: { warehouseId: wh.id, productId: oi.productId, type: "RETURN_IN", quantity: ri.quantity, reference: refund.id, notes: `Refund return for ${order.orderNumber}` },
            });
          }
        }
      }
    }

    const totalRefunded = alreadyRefunded + refundAmount;
    const newStatus = totalRefunded >= Number(order.totalAmount) ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await tx.order.update({ where: { id: order.id }, data: { status: newStatus, paymentStatus: newStatus as any } });

    await tx.auditLog.create({
      data: { userId, action: "ORDER_REFUNDED", entityType: "Order", entityId: order.id, metadata: { orderNumber: order.orderNumber, refundAmount, type: input.type, reason: input.reason } } as any,
    });

    return refund;
  });
}

// ============================================================
// SPLIT ORDER
// ============================================================

export async function splitOrderService(orderId: string, itemIds: string[], userId: string, companyId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new AppError("Order not found", 404);
    if (order.status === "COMPLETED" || order.status === "CANCELLED") throw new AppError(`Cannot split order with status ${order.status}`, 400);
    await tx.branch.findFirstOrThrow({ where: { id: order.branchId, companyId } });

    const splitItems = order.items.filter((i) => itemIds.includes(i.id));
    if (!splitItems.length) throw new AppError("No valid items to split", 400);
    if (splitItems.length === order.items.length) throw new AppError("Cannot split all items", 400);

    let newSub = 0, newDisc = 0;
    for (const i of splitItems) { newSub += Number(i.unitPrice) * Number(i.quantity); newDisc += Number(i.discount); }
    newSub = parseFloat(newSub.toFixed(2)); newDisc = parseFloat(newDisc.toFixed(2));
    const ratio = Number(order.subtotal) > 0 ? newSub / Number(order.subtotal) : 0;
    const newTax = parseFloat((Number(order.taxAmount) * ratio).toFixed(2));
    const newSvc = parseFloat((Number(order.serviceAmount) * ratio).toFixed(2));
    const newTotal = parseFloat((newSub - newDisc + newTax + newSvc).toFixed(2));

    const newNumber = await generateOrderNumber(order.branchId, tx);
    const newOrder = await tx.order.create({
      data: {
        branchId: order.branchId, createdById: order.createdById, customerId: order.customerId,
        orderNumber: newNumber, type: order.type, status: "OPEN",
        subtotal: newSub, discountAmount: newDisc, taxAmount: newTax, serviceAmount: newSvc, totalAmount: newTotal,
        sourceOrderId: order.id, parentOrderId: order.parentOrderId || order.id,
        items: { create: splitItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount, variantId: i.variantId, modifierTotal: i.modifierTotal, modifiers: i.modifiers as any, notes: i.notes })) },
      },
      include: { items: true },
    });

    for (const item of splitItems) await tx.orderItem.delete({ where: { id: item.id } });

    const remaining = order.items.filter((i) => !itemIds.includes(i.id));
    let origSub = 0, origDisc = 0;
    for (const i of remaining) { origSub += Number(i.unitPrice) * Number(i.quantity); origDisc += Number(i.discount); }
    origSub = parseFloat(origSub.toFixed(2)); origDisc = parseFloat(origDisc.toFixed(2));
    await tx.order.update({
      where: { id: order.id },
      data: { status: "SPLIT", subtotal: origSub, discountAmount: origDisc, taxAmount: parseFloat((Number(order.taxAmount) - newTax).toFixed(2)), serviceAmount: parseFloat((Number(order.serviceAmount) - newSvc).toFixed(2)), totalAmount: parseFloat((origSub - origDisc + Number(order.taxAmount) - newTax + Number(order.serviceAmount) - newSvc).toFixed(2)) },
    });

    await tx.auditLog.create({
      data: { userId, action: "ORDER_SPLIT", entityType: "Order", entityId: order.id, metadata: { sourceOrder: order.orderNumber, newOrder: newNumber, splitItemCount: splitItems.length } } as any,
    });

    return { originalOrder: order.id, newOrder };
  });
}

// ============================================================
// MERGE ORDER
// ============================================================

export async function mergeOrdersService(orderIds: string[], userId: string, companyId: string) {
  return prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({ where: { id: { in: orderIds } }, include: { items: true, payments: true } });
    if (orders.length < 2) throw new AppError("Need at least 2 orders to merge", 400);

    // All must be same branch + company
    const branchId = orders[0].branchId;
    const branch = await tx.branch.findFirst({ where: { id: branchId, companyId } });
    if (!branch) throw new AppError("Branch access denied", 403);
    for (const o of orders) {
      if (o.branchId !== branchId) throw new AppError("Cannot merge orders from different branches", 400);
      if (o.status === "COMPLETED" || o.status === "CANCELLED") throw new AppError(`Cannot merge order ${o.orderNumber} with status ${o.status}`, 400);
    }

    let totalSub = 0, totalDisc = 0, totalTax = 0, totalSvc = 0;
    const allItems: any[] = [];
    for (const o of orders) {
      totalSub += Number(o.subtotal); totalDisc += Number(o.discountAmount);
      totalTax += Number(o.taxAmount); totalSvc += Number(o.serviceAmount);
      for (const item of o.items) allItems.push(item);
    }

    const newTotal = parseFloat((totalSub - totalDisc + totalTax + totalSvc).toFixed(2));
    const newNumber = await generateOrderNumber(branchId, tx);

    const merged = await tx.order.create({
      data: {
        branchId, createdById: userId, customerId: orders[0].customerId,
        orderNumber: newNumber, type: orders[0].type, status: "OPEN",
        subtotal: totalSub, discountAmount: totalDisc, taxAmount: totalTax, serviceAmount: totalSvc, totalAmount: newTotal,
        parentOrderId: orders[0].id,
        items: { create: allItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount, variantId: i.variantId, modifierTotal: i.modifierTotal, modifiers: i.modifiers as any, notes: i.notes })) },
      },
      include: { items: true },
    });

    // Close source orders
    for (const o of orders) {
      await tx.order.update({ where: { id: o.id }, data: { status: "MERGED" } });
    }

    await tx.auditLog.create({
      data: { userId, action: "ORDERS_MERGED", entityType: "Order", entityId: merged.id, metadata: { mergedFrom: orders.map((o) => o.orderNumber), newOrder: newNumber } } as any,
    });

    return merged;
  });
}

// ============================================================
// HOLD / RESUME
// ============================================================

export async function holdOrderService(orderId: string, userId: string, companyId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  await prisma.branch.findFirstOrThrow({ where: { id: order.branchId, companyId } });
  if (order.status !== "OPEN" && order.status !== "DRAFT") throw new AppError(`Cannot hold order with status ${order.status}`, 400);

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "HELD" } });
  await prisma.auditLog.create({
    data: { userId, action: "ORDER_HELD", entityType: "Order", entityId: orderId, metadata: { orderNumber: order.orderNumber } } as any,
  });
  return updated;
}

export async function resumeOrderService(orderId: string, userId: string, companyId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  await prisma.branch.findFirstOrThrow({ where: { id: order.branchId, companyId } });
  if (order.status !== "HELD") throw new AppError(`Order is not on hold (status: ${order.status})`, 400);

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "OPEN" } });
  await prisma.auditLog.create({
    data: { userId, action: "ORDER_RESUMED", entityType: "Order", entityId: orderId, metadata: { orderNumber: order.orderNumber } } as any,
  });
  return updated;
}

// ============================================================
// GET ORDER BY ID
// ============================================================

export async function getOrderByIdService(orderId: string, companyId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, payments: true, refunds: true, customer: true, branch: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  const branch = await prisma.branch.findFirst({ where: { id: order.branchId, companyId } });
  if (!branch) throw new AppError("Access denied", 403);
  return order;
}
