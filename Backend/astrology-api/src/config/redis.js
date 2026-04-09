const redis = require("redis");

let client = null;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: { connectTimeout: 10000 },
    });

    client.on("error", (err) => {
      console.error("Redis client error:", err.message);
    });

    client.on("connect", () => {
      console.log("Redis connected");
    });

    await client.connect();
    return client;
  } catch (error) {
    console.warn("Redis unavailable, running without cache:", error.message);
    client = null;
    return null;
  }
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };
