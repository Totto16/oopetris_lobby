import {
    IsDefined,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Match } from '@decorators/all';
import { ApiProperty } from '@nestjs/swagger';
import { UserSignUpBase, userConstants } from '@oopetris_lobby/shared';

export class SignUpDto implements UserSignUpBase {
    @ApiProperty({
        minimum: userConstants.username.min,
        maximum: userConstants.username.max,
    })
    @IsString()
    @MinLength(userConstants.username.min)
    @MaxLength(userConstants.username.max)
    @IsDefined()
    username!: string;

    @ApiProperty({
        minimum: userConstants.password.min,
        maximum: userConstants.password.max,
    })
    @IsString()
    @MinLength(userConstants.password.min)
    @MaxLength(userConstants.password.max)
    @Matches(userConstants.password.regex, {
        message: 'password too weak',
    })
    @IsDefined()
    password!: string;

    @ApiProperty({
        minimum: userConstants.password.min,
        maximum: userConstants.password.max,
    })
    @IsString()
    @MinLength(userConstants.password.min)
    @MaxLength(userConstants.password.max)
    @IsDefined()
    @Match('password', { secret: true })
    passwordConfirm!: string;
}
