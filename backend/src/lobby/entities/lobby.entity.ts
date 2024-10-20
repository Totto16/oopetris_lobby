import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Lobby as LobbyType, type LobbyPlayer } from '@prisma/client';
import { LobbyBase, LobbyStatus } from '@shared/lobby';

export class Lobby implements LobbyType, LobbyBase {
    @ApiProperty({
        description: 'The unique lobby id (uuid)',
    })
    id!: string;

    @ApiProperty({
        description: 'The lobby name',
    })
    name!: string;

    @ApiProperty({
        description: 'The lobby size',
    })
    size!: number;

    @ApiProperty({
        description: 'The host of the lobby',
    })
    host_id!: string;

    //TODO: does this represent creation or the last state change (so that we know e.g. playing since 5 minutes)
    // It is created at creation of the lobby by the db with "@default(now())""
    @ApiProperty({
        description: 'The creation timestamp',
    })
    timestamp!: Date;

    @ApiPropertyOptional({
        description: 'The game server port, if one is running',
    })
    gameserver_port!: number | null;

    @ApiProperty({ enum: LobbyStatus, description: 'The status of the Lobby' })
    lobby_status!: LobbyStatus;
}

export type LobbyWithCountedPlayer = Lobby & {
    _count: {
        players: number;
    };
};

export type LobbyWithPlayers = Lobby & { players: LobbyPlayer[] };
