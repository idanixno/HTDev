import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRole } from "@zharfa/database";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";

/** Owner-only routes. Missing session and other roles look like a missing route. */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly auth: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await this.auth.canActivate(context);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw new NotFoundException();
      throw error;
    }
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!req.user || req.user.role !== UserRole.OWNER) throw new NotFoundException();
    return true;
  }
}
