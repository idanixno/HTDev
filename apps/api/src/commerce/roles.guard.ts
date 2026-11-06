import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRole } from "@zharfa/database";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";

/** Requires authenticated OWNER (instructor/admin). */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly auth: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = await this.auth.canActivate(context);
    if (!ok) return false;
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!req.user) {
      throw new UnauthorizedException("ورود لازم است.");
    }
    if (req.user.role !== UserRole.OWNER) {
      throw new ForbiddenException("فقط مالک می‌تواند این عمل را انجام دهد.");
    }
    return true;
  }
}
