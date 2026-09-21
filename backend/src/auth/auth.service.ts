import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  AuthProvider,
  User,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash } from "crypto";

import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthUser } from "./types/auth-user.type";
import { OAuthProfile } from "./types/oauth-profile.type";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        accounts: {
          create: {
            provider: AuthProvider.LOCAL,
            providerAccountId: dto.email.toLowerCase(),
          },
        },
      },
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.createSession(user);
  }

  async loginWithGoogle(profile: OAuthProfile) {
    return this.loginWithOAuthProvider(
      AuthProvider.GOOGLE,
      profile,
      "Google account email is required",
    );
  }

  async loginWithGithub(profile: OAuthProfile) {
    return this.loginWithOAuthProvider(
      AuthProvider.GITHUB,
      profile,
      "GitHub account email is required. Make sure your GitHub email is public or verified.",
    );
  }

  getAuthProviders() {
    return {
      google: Boolean(
        this.configService.get<string>("GOOGLE_CLIENT_ID") &&
          this.configService.get<string>("GOOGLE_CLIENT_SECRET"),
      ),
      github: Boolean(
        this.configService.get<string>("GITHUB_CLIENT_ID") &&
          this.configService.get<string>("GITHUB_CLIENT_SECRET"),
      ),
    };
  }

  private async loginWithOAuthProvider(
    provider: AuthProvider,
    profile: OAuthProfile,
    missingEmailMessage: string,
  ) {
    if (!profile.email) {
      throw new UnauthorizedException(missingEmailMessage);
    }

    const existingAccount = await this.prisma.userAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      await this.prisma.user.update({
        where: {
          id: existingAccount.userId,
        },
        data: {
          name: profile.name,
          avatarUrl: profile.avatarUrl ?? null,
          isEmailVerified: true,
        },
      });

      return this.createSession({
        ...existingAccount.user,
        name: profile.name,
        avatarUrl: profile.avatarUrl ?? null,
        isEmailVerified: true,
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: profile.email,
      },
    });

    if (existingUser) {
      const user = await this.prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: profile.name || existingUser.name,
          avatarUrl: profile.avatarUrl ?? existingUser.avatarUrl,
          isEmailVerified: true,
          accounts: {
            create: {
              provider,
              providerAccountId: profile.providerAccountId,
            },
          },
        },
      });

      return this.createSession(user);
    }

    const user = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl ?? null,
        isEmailVerified: true,
        accounts: {
          create: {
            provider,
            providerAccountId: profile.providerAccountId,
          },
        },
      },
    });

    return this.createSession(user);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const payload = await this.verifyToken(
      refreshToken,
      this.getRefreshSecret(),
    );

    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return this.createSession(storedToken.user);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  getCookieNames() {
    return {
      accessToken: ACCESS_TOKEN_COOKIE,
      refreshToken: REFRESH_TOKEN_COOKIE,
    };
  }

  private async createSession(user: User) {
    const authUser: AuthUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(
      {
        sub: authUser.userId,
        email: authUser.email,
        name: authUser.name,
      },
      {
        secret: this.getAccessSecret(),
        expiresIn: "15m",
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: authUser.userId,
      },
      {
        secret: this.getRefreshSecret(),
        expiresIn: "7d",
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: authUser,
      accessToken,
      refreshToken,
    };
  }

  private async verifyToken(
    token: string,
    secret: string,
  ): Promise<{ sub: string; email?: string; name?: string }> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private hashToken(token: string) {
    return createHash("sha256")
      .update(token)
      .digest("hex");
  }

  private getAccessSecret() {
    return this.configService.getOrThrow<string>(
      "JWT_ACCESS_SECRET",
    );
  }

  private getRefreshSecret() {
    return this.configService.getOrThrow<string>(
      "JWT_REFRESH_SECRET",
    );
  }
}