import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserSignInBase, userConstants } from '@shared/user';

export class SignInDto implements UserSignInBase {
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
    @IsDefined()
    password!: string;
}
