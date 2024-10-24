import { ApiProperty } from '@nestjs/swagger';
import type { JWTResponse } from '@oopetris_lobby/shared';
import { IsString } from 'class-validator';

export class JWTResponseDTO implements JWTResponse {
    @ApiProperty({
        description: 'The access token to use as Bearer Auth',
    })
    @IsString()
    access_token!: string;
}
