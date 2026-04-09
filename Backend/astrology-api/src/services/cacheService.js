const { getRedisClient } = require("../config/redis");

class CacheService {
  async get(key) {
    try {
      const client = getRedisClient();
      if (!client) return null;
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  async delete(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new CacheService();
