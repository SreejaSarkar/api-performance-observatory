import { Injectable } from "@nestjs/common";

import { PrismaService }
  from "../prisma/prisma.service";

import { RedisService }
  from "../redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly redis: RedisService,
  ) {}

  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;

    const redisStatus =
      await this.redis.ping();

    return {
      status: "UP",

      postgres: "CONNECTED",

      redis: redisStatus,

      timestamp:
        new Date().toISOString(),
    };
  }
}