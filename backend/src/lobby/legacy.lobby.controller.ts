import {
    Controller,
    HttpStatus,
    HttpCode,
    Get,
    Post,
    Req,
    Param,
    Delete,
    Put,
    Body,
    NotFoundException,
} from '@nestjs/common';
import { Public } from '@decorators/all';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    CreateLobbyRequest,
    type LobbyCreationResponse,
    type LobbyListResponse,
    type LobbyResponse,
    type SetClientReadyResponse,
    type StartResponse,
} from '../compatibility';
import { LobbyService } from './lobby.service';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { sleep } from '../common/common';
import type { GameServerService } from './game.server.service';

@ApiTags()
@Controller({ version: '1' })
export class LegacyLobbyController {
    constructor(
        private readonly lobbyService: LobbyService,
        private readonly gameServerService: GameServerService,
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('lobbies')
    async listLobbies(): Promise<LobbyListResponse> {
        return this.lobbyService.listAllLobbiesAtomical();
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('lobbies/:id')
    async joinLobby(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<void> {
        await this.lobbyService.joinIfPossibleAtomical(req.user.user, id);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('lobbies/:id')
    async lobbyDetail(@Param('id') id: string): Promise<LobbyResponse> {
        return this.lobbyService.detailAtomical(id);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('lobbies/:id')
    async deleteLobby(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<void> {
        return this.lobbyService.deleteIfPossibleAtomic(req.user.user, id);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('lobbies/:id/leave')
    async leaveLobby(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<void> {
        return this.lobbyService.leaveIfPossibleAtomic(req.user.user, id);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Post('lobbies/:id/start')
    async startLobby(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<StartResponse> {
        return this.lobbyService.startIfPossibleAtomic(req.user.user, id, {
            getPort: async () => {
                return this.gameServerService.getPort();
            },
            start: async (port, playerCount) => {
                await this.gameServerService.start(port, playerCount);
            },
        });
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @Post('lobbies')
    async createLobby(
        @Req() req: AuthenticatedRequest,
        @Body() data: CreateLobbyRequest,
    ): Promise<LobbyCreationResponse> {
        return this.lobbyService.createAtomic(req.user.user, data);
    }

    // NOTE: this uses a while loop and resolves with the port, this may take a while, since, if you set a player to ready, you can't start immediately as host, and you also might not start immediately, this is a bad idea, but the original implementation does this, so we need to do this here too, since the response has to have a port in it
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Post('lobby/:id/ready')
    async setReady(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<SetClientReadyResponse> {
        await this.lobbyService.readyPlayerAtomic(req.user.user, id);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const lobby = await this.lobbyService.findOne(id);

            if (!lobby) {
                throw new NotFoundException('Lobby was closed');
            }

            if (lobby.gameserver_port !== null) {
                return { port: lobby.gameserver_port };
            }

            await sleep(200);
        }
    }
}
