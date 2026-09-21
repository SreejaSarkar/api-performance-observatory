import {
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const requestedNextPath =
      typeof request.query.next === "string" && request.query.next.startsWith("/")
        ? request.query.next
        : "/projects";

    return {
      scope: ["email", "profile"],
      prompt: "select_account",
      state: Buffer.from(
        JSON.stringify({
          next: requestedNextPath,
        }),
      ).toString("base64url"),
    };
  }
}