import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import type {
  CookieOptions,
  Request,
  Response,
} from "express";

import { CurrentUser } from "./decorators/current-user.decorator";
import { GithubAuthGuard } from "./guards/github-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import type { AuthUser } from "./types/auth-user.type";
import type { OAuthProfile } from "./types/oauth-profile.type";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.register(dto);

    this.setAuthCookies(res, session.accessToken, session.refreshToken);

    return {
      user: session.user,
    };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.login(dto);

    this.setAuthCookies(res, session.accessToken, session.refreshToken);

    return {
      user: session.user,
    };
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.refresh(
      req.cookies?.refresh_token,
    );

    this.setAuthCookies(res, session.accessToken, session.refreshToken);

    return {
      user: session.user,
    };
  }

  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(
      req.cookies?.refresh_token,
    );

    this.clearAuthCookies(res);

    return {
      success: true,
    };
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return undefined;
  }

  @Get("github")
  @UseGuards(GithubAuthGuard)
  githubLogin() {
    return undefined;
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Query("state") state: string | undefined,
    @Res() res: Response,
  ) {
    const profile = req.user as OAuthProfile | undefined;

    if (!profile) {
      throw new InternalServerErrorException("Google profile missing");
    }

    const session = await this.authService.loginWithGoogle(profile);

    this.setAuthCookies(res, session.accessToken, session.refreshToken);

    const redirectUrl = new URL(
      this.getNextPath(state),
      process.env.FRONTEND_URL,
    );

    return res.redirect(redirectUrl.toString());
  }

  @Get("github/callback")
  @UseGuards(GithubAuthGuard)
  async githubCallback(
    @Req() req: Request,
    @Query("state") state: string | undefined,
    @Res() res: Response,
  ) {
    const profile = req.user as OAuthProfile | undefined;

    if (!profile) {
      throw new InternalServerErrorException("GitHub profile missing");
    }

    const session = await this.authService.loginWithGithub(profile);

    this.setAuthCookies(res, session.accessToken, session.refreshToken);

    const redirectUrl = new URL(
      this.getNextPath(state),
      process.env.FRONTEND_URL,
    );

    return res.redirect(redirectUrl.toString());
  }

  @Get("providers")
  providers() {
    return this.authService.getAuthProviders();
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @ApiOkResponse({
    description: "Current authenticated user",
  })
  async me(
    @CurrentUser() user: AuthUser,
  ) {
    return this.authService.getCurrentUser(
      user.userId,
    );
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie(
      "access_token",
      accessToken,
      this.getCookieOptions(15 * 60 * 1000),
    );

    res.cookie(
      "refresh_token",
      refreshToken,
      this.getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie("access_token", this.getCookieOptions());

    res.clearCookie("refresh_token", this.getCookieOptions());
  }

  private getCookieOptions(maxAge?: number): CookieOptions {
    const frontendUrl = process.env.FRONTEND_URL;
    const isSecureFrontend = frontendUrl?.startsWith("https://") ?? false;
    const cookieDomain = process.env.COOKIE_DOMAIN;

    return {
      httpOnly: true,
      sameSite: isSecureFrontend ? "none" : "lax",
      secure: isSecureFrontend,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      ...(typeof maxAge === "number" ? { maxAge } : {}),
    };
  }

  private getNextPath(state?: string) {
    if (!state) {
      return "/projects";
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8"),
      ) as { next?: string };

      if (decoded.next?.startsWith("/")) {
        return decoded.next;
      }
    } catch {
      return "/projects";
    }

    return "/projects";
  }
}