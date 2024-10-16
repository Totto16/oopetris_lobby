import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { SignInDto } from '../users/dto/sign-in';
import { JWTResponse } from '@todo-app/data-access';
export interface JWTContent {
    id: string;
    username: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(signInDto: SignInDto): Promise<JWTResponse> {
        const user = await this.usersService.findOneByUsername(
            signInDto.username,
        );
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
}
