import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export function useRealtimeOrders() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (!accessToken) return;
    const socket = io(SOCKET_URL, { auth: { token: accessToken } });
    socketRef.current = socket;
    socket.on("order:created", () => { queryClient.invalidateQueries({ queryKey: ["dashboard"] }); });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [accessToken, queryClient]);
}
