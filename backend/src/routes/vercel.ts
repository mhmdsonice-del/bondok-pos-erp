// Vercel-compatible routes — only modules that compile clean
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import orderRoutes from "../modules/orders/orders.routes";
import productRoutes from "../modules/products/products.routes";
import customerRoutes from "../modules/customers/customers.routes";
import supplierRoutes from "../modules/suppliers/suppliers.routes";
import employeeRoutes from "../modules/employees/employees.routes";
import branchRoutes from "../modules/branches/branches.routes";
import settingsRoutes from "../modules/settings/settings.routes";
import reportsRoutes from "../modules/reports/reports.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/employees", employeeRoutes);
router.use("/branches", branchRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportsRoutes);

export default router;
