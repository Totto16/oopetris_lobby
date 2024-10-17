import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { getUserId, JWTContent } from './auth.service';
import { IS_PUBLIC_KEY } from '@decorators/all';
import { Reflector } from '@nestjs/core';
import type { UserBase } from '@shared/user';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';

export type ResolvedUser = JWTContent & { user: UserBase };

export interface AuthenticationProperties {
    user: ResolvedUser;
    authenticated?: boolean;
}

export type AuthenticatedRequest = Request & AuthenticationProperties;

// A proxy that catches "casts" to AuthenticatedRequest AND don't check for the authenticated flag!, that aren't valid
const errorProxy: ResolvedUser = new Proxy<ResolvedUser>(
    { id: '', username: '', user: {} as UserBase },
    {
        get(_target, prop): never {
            throw new UnauthorizedException(
                `Trying to get user, even if not authorized: ${prop.toString()}`,
            );
        },
    },
);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthenticatedRequest = context
            .switchToHttp()
            .getRequest();

        // for safety
        request.user = errorProxy;
        request.authenticated = false;

        const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const token: string | undefined = this.extractTokenFromHeader(request);
        if (token === undefined || token === '') {
            throw new UnauthorizedException('No authorization token provided');
        }
        try {
            const payload: JWTContent = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.config.config.jwt_secret,
                },
            );

            const id = getUserId(payload);

            const user = await this.userService.findOne(id);

            if (!user) {
                throw new UnauthorizedException(
                    `User could not be found: id ${id}`,
                );
            }
            const result = { ...payload, user };

            // I assign the payload to the request object here
            // so that I can access it in our route handlers
            request.user = result;
            request.authenticated = true;
            return true;
        } catch {
            throw new UnauthorizedException('Unknown authorization error');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
