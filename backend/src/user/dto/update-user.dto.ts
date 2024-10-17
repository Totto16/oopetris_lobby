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
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    IsNotBcryptEncrypted,
    Match,
    ValidateIfDefined,
} from '@decorators/all';
import { SignUpDto } from './sign-up';

export class UpdateUserDto
    extends PartialType(SignUpDto)
    implements Partial<UserSignUpBase>
{
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
    @ValidateIf((object: UpdateUserDto) => object.password !== undefined)
    @Match<UpdateUserDto, 'password'>('password', { secret: true })
    @IsDefined()
    passwordConfirm?: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    @ValidateIfDefined()
    role?: UserRole;
}
