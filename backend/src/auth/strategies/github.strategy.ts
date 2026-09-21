import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
  Profile,
  Strategy,
} from "passport-github2";

import { OAuthProfile } from "../types/oauth-profile.type";

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  "github",
) {
  constructor(configService: ConfigService) {
    const backendUrl = configService.get<string>("BACKEND_URL") ?? "http://localhost:3001";

    super({
      clientID: configService.get<string>("GITHUB_CLIENT_ID") ?? "missing-github-client-id",
      clientSecret:
        configService.get<string>("GITHUB_CLIENT_SECRET") ?? "missing-github-client-secret",
      callbackURL:
        configService.get<string>("GITHUB_CALLBACK_URL") ?? `${backendUrl}/auth/github/callback`,
      scope: ["user:email"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): OAuthProfile {
    const primaryEmail = profile.emails?.[0]?.value?.toLowerCase();

    return {
      providerAccountId: profile.id,
      email: primaryEmail ?? "",
      name: profile.displayName || profile.username || primaryEmail || "GitHub user",
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}