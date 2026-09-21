import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubAuthGuard } from "./guards/github-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GithubStrategy } from "./strategies/github.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    PassportModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    GoogleAuthGuard,
    GithubAuthGuard,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}