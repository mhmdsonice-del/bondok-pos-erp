import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: env.CORS_ORIGIN } });
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try { socket.data.user = verifyAccessToken(token); return next(); } catch { return next(new Error("Unauthorized")); }
  });
  io.on("connection", (socket) => { const branchIds: string[] = socket.data.user?.branchIds ?? []; branchIds.forEach((branchId) => socket.join(`branch:${branchId}`)); });
  return io;
}

export function getIO(): Server | null { return io; }