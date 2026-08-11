import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initSocket } from "./sockets";
import { connectRedis } from "./config/redis";

async function main() {
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Bondok POS API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});