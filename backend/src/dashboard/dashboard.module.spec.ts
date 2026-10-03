import { MODULE_METADATA } from '@nestjs/common/constants';

import { AlertsModule } from '../alerts/alerts.module';
import { AnomaliesModule } from '../anomalies/anomalies.module';
import { MetricsModule } from '../metrics/metrics.module';
import { ProjectsModule } from 'src/projects/projects.module';

import { DashboardController } from './dashboard.controller';
import { DashboardModule } from './dashboard.module';
import { DashboardService } from './dashboard.service';

jest.mock('../alerts/alerts.module', () => ({
  AlertsModule: class AlertsModule {},
}));

jest.mock('../anomalies/anomalies.module', () => ({
  AnomaliesModule: class AnomaliesModule {},
}));

jest.mock('../metrics/metrics.module', () => ({
  MetricsModule: class MetricsModule {},
}));

jest.mock('src/projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

describe('DashboardModule', () => {
  it('registers the expected module metadata', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, DashboardModule),
    ).toEqual([MetricsModule, AlertsModule, AnomaliesModule, ProjectsModule]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, DashboardModule),
    ).toEqual([DashboardController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, DashboardModule),
    ).toEqual([DashboardService]);
  });
});
