import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
  Profile,
  Strategy,
} from "passport-google-oauth20";

import { OAuthProfile } from "../types/oauth-profile.type";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  "google",
) {
  constructor(configService: ConfigService) {
    const backendUrl = configService.get<string>("BACKEND_URL") ?? "http://localhost:3001";

    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID") ?? "missing-google-client-id",
      clientSecret:
        configService.get<string>("GOOGLE_CLIENT_SECRET") ?? "missing-google-client-secret",
      callbackURL:
        configService.get<string>("GOOGLE_CALLBACK_URL") ?? `${backendUrl}/auth/google/callback`,
      scope: ["email", "profile"],
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
      name: profile.displayName || primaryEmail || "Google user",
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}