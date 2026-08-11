import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

export async function createRecipeService(input: { productId: string; items: { rawMaterialId: string; quantity: number; unitName?: string }[] }) {
  if (input.items.length === 0) throw new AppError("Recipe must have at least one ingredient", 400);
  return prisma.$transaction(async (tx) => {
    await tx.recipeItem.deleteMany({ where: { productId: input.productId } });
    const recipeItems = await Promise.all(input.items.map((item) => tx.recipeItem.create({ data: { productId: input.productId, rawMaterialId: item.rawMaterialId, quantity: item.quantity, unitName: item.unitName } })));
    await tx.product.update({ where: { id: input.productId }, data: { isComposite: true } });
    return recipeItems;
  });
}

export async function getRecipeService(productId: string) {
  return prisma.recipeItem.findMany({ where: { productId }, include: { rawMaterial: { select: { name: true, costPrice: true, unit: { select: { name: true } } } } }, orderBy: { rawMaterial: { name: "asc" } } });
}

export async function calculateFoodCostService(productId: string) {
  const recipe = await prisma.recipeItem.findMany({ where: { productId }, include: { rawMaterial: { select: { costPrice: true } } } });
  const totalCost = recipe.reduce((sum, item) => sum + Number(item.rawMaterial.costPrice) * Number(item.quantity), 0);
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  return { productId, productName: product.name, foodCost: totalCost, sellPrice: Number(product.sellPrice), marginPercent: Number(product.sellPrice) > 0 ? Math.round(((Number(product.sellPrice) - totalCost) / Number(product.sellPrice)) * 100 * 100) / 100 : 0 };
}

export async function explodeRecipeService(productId: string, quantity: number, warehouseId: string, orderReference: string) {
  const recipe = await prisma.recipeItem.findMany({ where: { productId } });
  if (recipe.length === 0) throw new AppError("No recipe found for this product", 404);
  return prisma.$transaction(async (tx) => {
    for (const item of recipe) {
      const required = Number(item.quantity) * quantity;
      const stock = await tx.stockLevel.findFirst({ where: { warehouseId, productId: item.rawMaterialId, batchNumber: null } });
      if (!stock || Number(stock.quantity) < required) throw new AppError(`Insufficient stock for ${item.rawMaterialId}: need ${required}, have ${stock ? Number(stock.quantity) : 0}`, 400);
      await tx.stockLevel.update({ where: { id: stock.id }, data: { quantity: { decrement: required } } });
      await tx.stockMovement.create({ data: { warehouseId, productId: item.rawMaterialId, type: "SALE_OUT", quantity: required, reference: orderReference } });
    }
    return { success: true };
  });
}