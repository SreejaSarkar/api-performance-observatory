import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";
import { ProjectsModule } from "src/projects/projects.module";
import { MetricsIngestionController } from "./metrics-ingestion.controller";
import { RedisModule } from "src/redis/redis.module";
import { MetricsGateway } from './metrics.gateway';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ProjectsModule,
  ],
  controllers: [
    MetricsController,
    MetricsIngestionController,
  ],
  providers: [
    MetricsService,
    MetricsGateway,
  ],
  exports: [MetricsService]
})
export class MetricsModule {}