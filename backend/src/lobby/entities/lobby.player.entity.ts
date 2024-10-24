import { ApiProperty } from '@nestjs/swagger';
import { LobbyPlayer as LobbyPlayerType } from '@prisma/client';
import { LobbyPlayerBase } from '@oopetris_lobby/shared';

export class LobbyPlayer implements LobbyPlayerType, LobbyPlayerBase {
    @ApiProperty({
        description: 'The unique id of the player',
    })
    player_id!: string;

    @ApiProperty({
        description: 'The unique id of the lobby',
    })
    lobby_id!: string;

    @ApiProperty({
        description: 'If the player is ready or not',
    })
    is_ready!: boolean;
}
