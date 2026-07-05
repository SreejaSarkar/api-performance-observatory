import { Injectable } from "@nestjs/common";

import Redis from "ioredis";

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(
      process.env.REDIS_URL!,
    );
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(
    key: string,
    value: string,
    ttl: number,
  ) {
    return this.redis.set(
      key,
      value,
      "EX",
      ttl,
    );
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async delByPrefix(prefix: string) {
    const stream = this.redis.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = this.redis.pipeline();
    return new Promise<void>((resolve) => {
      stream.on("data", (keys: string[]) => {
        for (const key of keys) {
          pipeline.del(key);
        }
      });
      stream.on("end", async () => {
        await pipeline.exec();
        resolve();
      });
    });
  }

  async ping() {
    return this.redis.ping();
  }
}