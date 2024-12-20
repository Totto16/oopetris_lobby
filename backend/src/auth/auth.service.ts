import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../user/dto/sign-in';
import type { JWTResponse } from '@oopetris_lobby/shared';
import type { JwtPayload, LoginResponse } from '../compatibility';
interface JWTContentV2 {
    id: string;
    username: string;
}

export type JWTContent = JwtPayload | JWTContentV2;

function isV2JWTPayload(payload: JWTContent): payload is JWTContentV2 {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (payload as any).id !== undefined;
}

export function getUserId(content: JWTContent): string {
    if (isV2JWTPayload(content)) {
        return content.id;
    }

    return content.user_id;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(signInDto: SignInDto): Promise<JWTResponse> {
        const user = await this.userService.findOneByUsername(
            signInDto.username,
        );
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (user === undefined || user === null) {
            throw new UnauthorizedException('User not found');
        }

        if (!bcrypt.compareSync(signInDto.password, user.password)) {
            throw new UnauthorizedException('Wrong password');
        }

        const payload: JWTContent = { id: user.id, username: user.username };

        const access_token = await this.jwtService.signAsync(payload);
        return {
            access_token,
        };
    }

    async legacySignIn(signInDto: SignInDto): Promise<LoginResponse> {
        const user = await this.userService.findOneByUsername(
            signInDto.username,
        );
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (user === undefined || user === null) {
            throw new UnauthorizedException('User not found');
        }

        if (!bcrypt.compareSync(signInDto.password, user.password)) {
            throw new UnauthorizedException('Wrong password');
        }

        const payload: JwtPayload = { user_id: user.id };

        const jwt = await this.jwtService.signAsync(payload);
        return {
            jwt,
        };
    }
}
