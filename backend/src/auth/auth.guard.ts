import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTContent } from './auth.service';
import { IS_PUBLIC_KEY } from '@decorators/all';
import { Reflector } from '@nestjs/core';

export type AuthenticationProperties = {
    user: JWTContent;
    authenticated?: boolean;
};

export type AuthenticatedRequest = Request & AuthenticationProperties;

// A proxy that catches "casts" to AuthenticatedRequest AND don't check for the authenticated flag!, that aren't valid
const errorProxy: JWTContent = new Proxy<JWTContent>(
    { sub: '', username: '' },
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
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthenticatedRequest = context
            .switchToHttp()
            .getRequest();

        // for safety
        request['user'] = errorProxy;
        request['authenticated'] = false;

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
                    secret: jwtConstants.secret,
                },
            );
            // I assign the payload to the request object here
            // so that I can access it in our route handlers
            request['user'] = payload;
            request['authenticated'] = true;
        } catch {
            throw new UnauthorizedException('Unknown authorization error');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
