import { getRedisClient } from "../config/redis";
import { BaseService } from "../core/BaseService";
import { ICacheService } from "./interfaces/ICacheService";

export class CacheService extends BaseService implements ICacheService {
  protected readonly serviceName = "CacheService";

  public async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      if (!client) return null;
      const raw = await client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      this.logError("Cache GET failed", error instanceof Error ? error.stack : undefined);
      return null;
    }
  }

  public async set(key: string, value: unknown, ttl = 3600): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logError("Cache SET failed", error instanceof Error ? error.stack : undefined);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.del(key);
      return true;
    } catch (error) {
      this.logError("Cache DELETE failed", error instanceof Error ? error.stack : undefined);
      return false;
    }
  }
}

export const cacheService = new CacheService();
