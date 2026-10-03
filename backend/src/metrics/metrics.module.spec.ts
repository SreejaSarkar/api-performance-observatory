import { MODULE_METADATA } from '@nestjs/common/constants';

import { PrismaModule } from '../prisma/prisma.module';
import { MetricsController } from './metrics.controller';
import { MetricsGateway } from './metrics.gateway';
import { MetricsIngestionController } from './metrics-ingestion.controller';
import { MetricsModule } from './metrics.module';
import { MetricsService } from './metrics.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { RedisModule } from 'src/redis/redis.module';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('src/projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

jest.mock('src/redis/redis.module', () => ({
  RedisModule: class RedisModule {},
}));

describe('MetricsModule', () => {
  it('registers the expected module metadata', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, MetricsModule)).toEqual(
      [PrismaModule, RedisModule, ProjectsModule],
    );
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, MetricsModule),
    ).toEqual([MetricsController, MetricsIngestionController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, MetricsModule),
    ).toEqual([MetricsService, MetricsGateway]);
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, MetricsModule)).toEqual(
      [MetricsService],
    );
  });
});
