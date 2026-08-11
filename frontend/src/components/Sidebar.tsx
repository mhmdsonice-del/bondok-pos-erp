import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Warehouse,
  Users,
  Truck,
  UserCog,
  Building2,
  Wallet,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { BranchSelector } from "@/components/BranchSelector";

const NAV_ITEMS = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/pos", label: "الكاشير", icon: UtensilsCrossed },
  { to: "/products", label: "المنتجات", icon: Package },
  { to: "/inventory", label: "المخزون", icon: Warehouse },
  { to: "/customers", label: "العملاء", icon: Users },
  { to: "/suppliers", label: "الموردين", icon: Truck },
  { to: "/employees", label: "الموظفين", icon: UserCog },
  { to: "/branches", label: "الفروع", icon: Building2 },
  { to: "/cash-register", label: "الخزنة", icon: Wallet },
  { to: "/reports", label: "التقارير", icon: FileBarChart },
  { to: "/settings", label: "الإعدادات", icon: Settings },
  { to: "/erp-v8", label: "ERP Pro V8", icon: FileBarChart, external: true },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="flex h-screen w-[220px] shrink-0 flex-col border-l border-char-800 bg-char-900">
      <div className="flex items-center gap-2 border-b border-char-800 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-flame-400 to-flame-600 font-display text-char-950">
          B
        </div>
        <span className="font-display text-lg tracking-wide">BONDOK</span>
      </div>

      <div className="border-b border-char-800 px-3 py-2">
        <BranchSelector />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, external }) => {
            if (external) {
              return (
                <li key={to}>
                  <a
                    href={`/erp-v8.html`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sesame-100/60 hover:bg-char-800 hover:text-sesame-50 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={18} />
                    {label}
                  </a>
                </li>
              );
            }
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-flame-500/15 text-flame-400"
                        : "text-sesame-100/60 hover:bg-char-800 hover:text-sesame-50"
                    )
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-char-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="text-sesame-50 font-medium leading-tight">{user?.fullName ?? "—"}</p>
            <p className="text-xs text-sesame-100/40">{user?.role ?? "—"}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sesame-100/40 hover:bg-char-800 hover:text-chili-500 transition-colors"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
