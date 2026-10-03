import { MODULE_METADATA } from '@nestjs/common/constants';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ProjectsController } from './projects.controller';
import { ProjectsModule } from './projects.module';
import { ProjectsService } from './projects.service';

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('../auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));

describe('ProjectsModule', () => {
  it('registers the expected module metadata', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, ProjectsModule),
    ).toEqual([PrismaModule, AuthModule]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ProjectsModule),
    ).toEqual([ProjectsController]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ProjectsModule),
    ).toEqual([ProjectsService]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ProjectsModule),
    ).toEqual([ProjectsService]);
  });
});
