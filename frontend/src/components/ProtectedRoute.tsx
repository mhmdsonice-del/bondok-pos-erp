import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  useRealtimeOrders();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
