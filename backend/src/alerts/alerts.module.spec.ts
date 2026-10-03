import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { MetricsModule } from 'src/metrics/metrics.module';
import { AlertsController } from './alerts.controller';
import { AlertsModule } from './alerts.module';
import { AlertsService } from './alerts.service';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('../projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

jest.mock('src/metrics/metrics.module', () => ({
  MetricsModule: class MetricsModule {},
}));

describe('AlertsModule', () => {
  it('registers the expected module metadata', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, AlertsModule)).toEqual([
      PrismaModule,
      ProjectsModule,
      MetricsModule,
    ]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AlertsModule),
    ).toEqual([AlertsController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AlertsModule),
    ).toEqual([AlertsService]);
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, AlertsModule)).toEqual([
      AlertsService,
    ]);
  });
});
