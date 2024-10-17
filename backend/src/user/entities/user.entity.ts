import { ApiProperty } from '@nestjs/swagger';
import { User as UserType } from '@prisma/client';
import { UserRole, UserBase, userConstants } from '@shared/user';

export class User implements UserType, UserBase {
    @ApiProperty({
        description: ' The unique user id (uuid)',
    })
    id!: string;

    @ApiProperty({
        description: ' The unique username',
        minimum: userConstants.username.min,
        maximum: userConstants.username.max,
    })
    username!: string;

    @ApiProperty({
        description: ' The hashed ands salted password',
        minimum: userConstants.password.min,
        maximum: userConstants.password.max,
    })
    password!: string;

    @ApiProperty({ enum: UserRole, description: 'The role of the user' })
    role!: UserRole;
}
