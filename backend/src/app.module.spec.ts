import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AlertsModule } from './alerts/alerts.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AppModule } from './app.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { RedisModule } from './redis/redis.module';
import { ReportsModule } from './reports/reports.module';
import { WebhooksModule } from './webhooks/webhooks.module';

jest.mock('@nestjs/config', () => {
  class ConfigModule {}

  return {
    ConfigModule: {
      forRoot: jest.fn((options) => ({
        module: ConfigModule,
        options,
      })),
    },
  };
});

jest.mock('@nestjs/schedule', () => {
  class ScheduleModule {}

  return {
    ScheduleModule: {
      forRoot: jest.fn(() => ({
        module: ScheduleModule,
      })),
    },
  };
});

const { ConfigModule: mockedConfigModule } = jest.requireMock('@nestjs/config') as {
  ConfigModule: {
    forRoot: jest.Mock;
  };
};

const { ScheduleModule: mockedScheduleModule } = jest.requireMock(
  '@nestjs/schedule',
) as {
  ScheduleModule: {
    forRoot: jest.Mock;
  };
};

jest.mock('./metrics/metrics.module', () => ({
  MetricsModule: class MetricsModule {},
}));

jest.mock('./prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('./redis/redis.module', () => ({
  RedisModule: class RedisModule {},
}));

jest.mock('./health/health.module', () => ({
  HealthModule: class HealthModule {},
}));

jest.mock('./projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

jest.mock('./alerts/alerts.module', () => ({
  AlertsModule: class AlertsModule {},
}));

jest.mock('./anomalies/anomalies.module', () => ({
  AnomaliesModule: class AnomaliesModule {},
}));

jest.mock('./dashboard/dashboard.module', () => ({
  DashboardModule: class DashboardModule {},
}));

jest.mock('./reports/reports.module', () => ({
  ReportsModule: class ReportsModule {},
}));

jest.mock('./webhooks/webhooks.module', () => ({
  WebhooksModule: class WebhooksModule {},
}));

jest.mock('./auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));

describe('AppModule', () => {
  it('registers the expected root module imports', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[];
    const scheduleImport = mockedScheduleModule.forRoot.mock.results[0]?.value;
    const configImport = mockedConfigModule.forRoot.mock.results[0]?.value;

    expect(mockedScheduleModule.forRoot.mock.calls).toEqual([[]]);
    expect(mockedConfigModule.forRoot.mock.calls).toEqual([
      [
        {
          isGlobal: true,
          validationSchema,
        },
      ],
    ]);

    expect(imports).toHaveLength(13);
    expect(imports[0]).toBe(scheduleImport);
    expect(imports[1]).toBe(configImport);
    expect(
      (configImport as { options: { isGlobal: boolean; validationSchema: unknown } }).options,
    ).toEqual({
      isGlobal: true,
      validationSchema,
    });
    expect(imports.slice(2)).toEqual([
      ProjectsModule,
      PrismaModule,
      RedisModule,
      HealthModule,
      MetricsModule,
      AuthModule,
      AlertsModule,
      AnomaliesModule,
      DashboardModule,
      ReportsModule,
      WebhooksModule,
    ]);
  });
});