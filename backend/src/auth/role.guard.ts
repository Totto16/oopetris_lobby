import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './auth.guard';
import { ROLES_KEY } from '@decorators/all';
import { UserRole } from '@oopetris_lobby/shared';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request: AuthenticatedRequest = context
            .switchToHttp()
            .getRequest();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }

            if (err instanceof Error) {
                throw new UnauthorizedException(
                    `Authorization error: ${err.message}`,
                );
            }

            throw new UnauthorizedException('Unknown authorization error');
        }
    }
}
