import { Module } from "@nestjs/common";
import { MetricsModule } from './metrics/metrics.module';

import { ConfigModule }
  from "@nestjs/config";

import { validationSchema }
  from "./config/env.validation";

import { PrismaModule }
  from "./prisma/prisma.module";

import { RedisModule }
  from "./redis/redis.module";

import { HealthModule }
  from "./health/health.module";
import { ProjectsModule } from "./projects/projects.module";
import { AlertsModule } from './alerts/alerts.module';
import { ScheduleModule } from "@nestjs/schedule";
import { AnomaliesModule } from "./anomalies/anomalies.module";
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    ProjectsModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    MetricsModule,
    AlertsModule,
    AnomaliesModule,
    DashboardModule,
    ReportsModule,
    WebhooksModule,
  ],
})
export class AppModule {}