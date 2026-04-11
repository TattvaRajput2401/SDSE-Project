import { createClient, RedisClientType } from "redis";
import { logger } from "../utils/logger";

let client: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: { connectTimeout: 10000 },
    });

    client.on("error", (err) => {
      logger.error(`Redis client error: ${err.message}`);
    });

    client.on("connect", () => {
      logger.info("Redis connected");
    });

    await client.connect();
    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown redis error";
    logger.warn(`Redis unavailable, running without cache: ${message}`);
    client = null;
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => client;
