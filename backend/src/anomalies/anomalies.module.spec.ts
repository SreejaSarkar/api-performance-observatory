import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AnomaliesController } from './anomalies.controller';
import { AnomaliesModule } from './anomalies.module';
import { AnomaliesService } from './anomalies.service';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('../projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

describe('AnomaliesModule', () => {
  it('registers the expected module metadata', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, AnomaliesModule),
    ).toEqual([PrismaModule, ProjectsModule]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AnomaliesModule),
    ).toEqual([AnomaliesController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AnomaliesModule),
    ).toEqual([AnomaliesService, AnomalyDetectionService]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, AnomaliesModule),
    ).toEqual([AnomaliesService]);
  });
});
