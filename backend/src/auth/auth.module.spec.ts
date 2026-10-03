import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

jest.mock('@nestjs/config', () => ({
  ConfigModule: class ConfigModule {},
}));

jest.mock('@nestjs/jwt', () => ({
  JwtModule: class JwtModule {},
}));

jest.mock('@nestjs/passport', () => ({
  PassportModule: class PassportModule {},
}));

jest.mock('../prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));

jest.mock('./guards/github-auth.guard', () => ({
  GithubAuthGuard: class GithubAuthGuard {},
}));

jest.mock('./guards/google-auth.guard', () => ({
  GoogleAuthGuard: class GoogleAuthGuard {},
}));

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));

jest.mock('./strategies/github.strategy', () => ({
  GithubStrategy: class GithubStrategy {},
}));

jest.mock('./strategies/google.strategy', () => ({
  GoogleStrategy: class GoogleStrategy {},
}));

describe('AuthModule', () => {
  it('registers the expected module metadata', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.IMPORTS, AuthModule)).toEqual([
      ConfigModule,
      JwtModule,
      PassportModule,
      PrismaModule,
    ]);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AuthModule),
    ).toEqual([AuthController]);
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AuthModule)).toEqual([
      AuthService,
      JwtAuthGuard,
      GoogleAuthGuard,
      GithubAuthGuard,
      GoogleStrategy,
      GithubStrategy,
    ]);
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, AuthModule)).toEqual([
      AuthService,
      JwtAuthGuard,
      JwtModule,
    ]);
  });
});
