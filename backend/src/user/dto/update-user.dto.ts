import {
    IsDefined,
    IsEnum,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { UserRole, UserSignUpBase, userConstants } from '@shared/user';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotBcryptEncrypted,
    Match,
    ValidateIfDefined,
} from '@decorators/all';

export class UpdateUserDto implements Partial<UserSignUpBase> {
    @ApiProperty({
        required: false,
        minimum: userConstants.username.min,
        maximum: userConstants.username.max,
    })
    @IsString()
    @MinLength(userConstants.username.min)
    @MaxLength(userConstants.username.max)
    @Matches(userConstants.password.regex, {
        message: 'password too weak',
    })
    @ValidateIfDefined()
    @IsNotBcryptEncrypted()
    password?: string;

    @ApiProperty({
        required: false,
        minimum: userConstants.password.min,
        maximum: userConstants.password.max,
    })
    @IsString()
    @MinLength(userConstants.password.min)
    @MaxLength(userConstants.password.max)
    @ValidateIf((object) => object['password'] !== undefined)
    @Match('password', { secret: true })
    @IsDefined()
    passwordConfirm?: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    @ValidateIfDefined()
    role?: UserRole;
}