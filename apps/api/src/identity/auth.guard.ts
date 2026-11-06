import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SessionService, SESSION_COOKIE_NAME } from "./session.service";
import { toPublicUser, type PublicUser } from "./public-user";

export type AuthedRequest = Request & {
  user?: PublicUser;
  sessionToken?: string;
};

export function extractSessionToken(req: Request): string | null {
  const cookieToken =
    (req.cookies?.[SESSION_COOKIE_NAME] as string | undefined) ?? null;
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim() || null;
  }

  // BFF may forward as custom header
  const forwarded = req.headers["x-session-token"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.trim();
  }

  return null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = extractSessionToken(req);
    if (!token) {
      throw new UnauthorizedException("ورود لازم است.");
    }
    const session = await this.sessions.findValidSession(token);
    if (!session) {
      throw new UnauthorizedException("نشست نامعتبر یا منقضی است.");
    }
    req.user = toPublicUser(session.user);
    req.sessionToken = token;
    return true;
  }
}
