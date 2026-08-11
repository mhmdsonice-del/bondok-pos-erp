import { createClient } from "redis";
import { env } from "./env";

// Redis is optional — only used when REDIS_URL is configured
export const redisClient = env.REDIS_URL ? createClient({ url: env.REDIS_URL }) : null;

if (redisClient) {
  redisClient.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("Redis Client Error", err);
  });
}

export async function connectRedis() {
  if (redisClient && !redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}
