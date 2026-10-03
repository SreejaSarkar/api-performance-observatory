import { Injectable } from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl: number) {
    return this.redis.set(key, value, 'EX', ttl);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async delByPrefix(prefix: string) {
    const stream = this.redis.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = this.redis.pipeline();
    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const finish = async () => {
        if (settled) {
          return;
        }

        settled = true;

        try {
          await pipeline.exec();
          resolve();
        } catch (error) {
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to delete redis keys by prefix'),
          );
        }
      };

      stream.on('data', (keys: string[]) => {
        for (const key of keys) {
          pipeline.del(key);
        }
      });

      stream.on('end', () => {
        void finish();
      });

      stream.on('error', (error: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(error);
      });
    });
  }

  async ping() {
    return this.redis.ping();
  }
}
