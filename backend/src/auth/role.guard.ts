import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './auth.guard';
import { ROLES_KEY } from '@decorators/all';
import { UserRole } from '@shared/user';
import type { UserService } from 'src/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthenticatedRequest = context
            .switchToHttp()
            .getRequest();

        if (request.authenticated !== true || !request.user) {
            throw new UnauthorizedException('Not authorized');
        }

        const roles: UserRole[] = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        try {
            if (roles.includes(request.user.user.role)) {
                return true;
            }

            throw new UnauthorizedException(
                `Not allowed for role '${request.user.user.role}'`,
            );
        } catch {
            throw new UnauthorizedException('Unknown authorization error');
        }
    }
}
