import { MODULE_METADATA } from '@nestjs/common/constants';

import { PrismaModule } from '../prisma/prisma.module';

import { ReportsController } from './reports.controller';
import { ReportsModule } from './reports.module';
import { ReportsService } from './reports.service';
import { ProjectsModule } from 'src/projects/projects.module';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('src/projects/projects.module', () => ({
  ProjectsModule: class ProjectsModule {},
}));

describe('ReportsModule', () => {
  it('registers the expected module metadata', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, ReportsModule)).toEqual(
      [PrismaModule, ProjectsModule],
    );
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ReportsModule),
    ).toEqual([ReportsController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ReportsModule),
    ).toEqual([ReportsService]);
  });
});
