import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
    Lobby,
    LobbyWithCountedPlayer,
    LobbyWithPlayers,
} from './entities/lobby.entity';
import type {
    CreateLobbyRequest,
    HostInfo,
    LobbyCreationResponse,
    LobbyInfoReturnValue,
    LobbyListResponse,
    LobbyResponse,
    PlayerInfo,
    StartResponse,
} from '../compatibility';
import type { User } from '../user/entities/user.entity';
import { Prisma, type PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LobbyStatus } from '@shared/lobby';
import { UserRole } from '@shared/user';

type PrismaImplClient = PrismaClient | Prisma.TransactionClient;

const MAX_RETRIES = 10;

export type GameServerGetPort = () => Promise<number> | number;

export type GameServerStart = (
    port: number,
    playerCount: number,
) => Promise<void> | void;

export interface GameServerCallback {
    getPort: GameServerGetPort;
    start: GameServerStart;
}

@Injectable()
export class LobbyService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Lobby[] | null> {
        return this.prisma.lobby.findMany({});
    }

    private async findOneImpl(
        id: string,
        prismaClient: PrismaImplClient,
    ): Promise<Lobby | null> {
        return prismaClient.lobby.findUnique({ where: { id } });
    }

    async findOne(id: string): Promise<Lobby | null> {
        return this.findOneImpl(id, this.prisma);
    }

    private async findAllActiveImpl(
        prismaClient: PrismaImplClient,
    ): Promise<Lobby[]> {
        return prismaClient.lobby.findMany({
            where: { lobby_status: { in: ['Open', 'Running'] } },
        });
    }

    async findAllActive(): Promise<Lobby[]> {
        return this.findAllActiveImpl(this.prisma);
    }

    private lobbyHasPlayers(
        lobby: Lobby | LobbyWithCountedPlayer | LobbyWithPlayers,
    ): lobby is LobbyWithPlayers {
        return (lobby as Partial<LobbyWithPlayers>).players !== undefined;
    }

    private lobbyHasPlayersCount(
        lobby: Lobby | LobbyWithCountedPlayer | LobbyWithPlayers,
    ): lobby is LobbyWithCountedPlayer {
        return (
            (lobby as Partial<LobbyWithCountedPlayer>)._count?.players !==
            undefined
        );
    }

    private getPlayerNumberInLobbyWithoutTransaction(
        lobby: LobbyWithCountedPlayer | LobbyWithPlayers,
    ): number {
        let players: number;

        if (this.lobbyHasPlayers(lobby)) {
            players = lobby.players.length;
        } else {
            players = lobby._count.players;
        }

        // add the host
        return players + 1;
    }

    private async getPlayerNumberInLobbyImpl(
        lobby: Lobby | LobbyWithCountedPlayer | LobbyWithPlayers,
        prismaClient: PrismaImplClient,
    ): Promise<number> {
        if (this.lobbyHasPlayers(lobby) || this.lobbyHasPlayersCount(lobby)) {
            return this.getPlayerNumberInLobbyWithoutTransaction(lobby);
        }
        const players = await prismaClient.lobbyPlayer.count({
            where: { lobby_id: lobby.id },
        });

        // add the host
        return players + 1;
    }

    async getPlayerNumberInLobby(
        lobby: Lobby | LobbyWithCountedPlayer | LobbyWithPlayers,
    ): Promise<number> {
        return this.getPlayerNumberInLobbyImpl(lobby, this.prisma);
    }

    private async getHostInfoImpl(
        lobby: Lobby,
        prismaClient: PrismaImplClient,
    ): Promise<HostInfo> {
        const user = await prismaClient.user.findUnique({
            where: { id: lobby.host_id },
        });

        if (!user) {
            throw new InternalServerErrorException(
                `Can't find host of lobby '${lobby.id}'`,
            );
        }

        return { id: user.id, name: user.username };
    }

    async getHostInfo(lobby: Lobby): Promise<HostInfo> {
        return this.getHostInfoImpl(lobby, this.prisma);
    }

    async listAllLobbiesAtomical(): Promise<LobbyListResponse> {
        try {
            const result: LobbyListResponse = await this.prisma.$transaction(
                async (transactionClient) => {
                    const rawLobbies =
                        await this.findAllActiveImpl(transactionClient);

                    const finalLobbies: Promise<LobbyInfoReturnValue>[] =
                        rawLobbies.map(
                            async (lobby): Promise<LobbyInfoReturnValue> => {
                                const { id, name, size } = lobby;
                                const num_players_in_lobby =
                                    await this.getPlayerNumberInLobbyImpl(
                                        lobby,
                                        transactionClient,
                                    );
                                const host_info = await this.getHostInfoImpl(
                                    lobby,
                                    transactionClient,
                                );

                                return {
                                    id,
                                    name,
                                    size,
                                    num_players_in_lobby,
                                    host_info,
                                };
                            },
                        );

                    const lobbies = await Promise.all(finalLobbies);

                    return { lobbies };
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );

            return result;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    private async isUserInLobbyImpl(
        user: User,
        transactionClient: PrismaImplClient,
    ): Promise<Lobby | null> {
        return transactionClient.lobby.findFirst({
            where: {
                OR: [
                    { host_id: user.id },
                    {
                        players: {
                            some: { player_id: user.id },
                        },
                    },
                ],
            },
        });
    }

    private async joinIfPossibleImpl(
        user: User,
        lobby_id: string,
        retries: number,
    ): Promise<void> {
        try {
            await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await transactionClient.lobby.findUnique({
                        where: { id: lobby_id },
                        include: { _count: true },
                    });

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status != LobbyStatus.Open) {
                        const reason = (() => {
                            switch (lobby.lobby_status) {
                                case LobbyStatus.Closed:
                                    return 'the lobby is already closed';
                                case LobbyStatus.Finished:
                                    return 'the lobby is already finished';
                                case LobbyStatus.Running:
                                    return 'the lobby is currently running';
                                default:
                                    return 'unknown status of the lobby';
                            }
                        })();

                        throw new BadRequestException(
                            `You can't join the lobby with id ${lobby_id}. Reason: ${reason}`,
                        );
                    }

                    const players =
                        this.getPlayerNumberInLobbyWithoutTransaction(lobby);

                    if (players >= lobby.size) {
                        throw new BadRequestException(`Lobby is already full`);
                    }

                    const userIsInLobby = await this.isUserInLobbyImpl(
                        user,
                        transactionClient,
                    );

                    if (userIsInLobby !== null) {
                        throw new BadRequestException(
                            'This user is already inside another lobby',
                        );
                    }

                    //NOTE: this creates a relation and inserts that into the array
                    //TODO: check if it is done correctly
                    await transactionClient.lobby.update({
                        where: { id: lobby.id },
                        data: {
                            players: {
                                create: {
                                    player_id: user.id,
                                    is_ready: false,
                                },
                            },
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2034') {
                    if (retries >= MAX_RETRIES) {
                        throw new InternalServerErrorException(
                            `Transaction failed repeatedly, after ${retries.toString()} times: ${err.message}`,
                        );
                    }

                    return this.joinIfPossibleImpl(user, lobby_id, retries + 1);
                }

                throw new InternalServerErrorException(err.message);
            }

            throw err;
        }
    }

    // NOTE: the join operation is wrapped in a transaction, so it may fail, since another one joined faster, so we try multiple joins, if the transaction fails, if we received a logical error(like e.g. it's already full) we abort early and return that error
    async joinIfPossibleAtomical(user: User, lobby_id: string): Promise<void> {
        return this.joinIfPossibleImpl(user, lobby_id, 0);
    }

    async detailAtomical(lobby_id: string): Promise<LobbyResponse> {
        try {
            const result: LobbyResponse = await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await transactionClient.lobby.findUnique({
                        where: { id: lobby_id },
                        include: { players: true },
                    });

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no active lobby with id ${lobby_id}`,
                        );
                    }

                    const num_players_in_lobby =
                        this.getPlayerNumberInLobbyWithoutTransaction(lobby);
                    const host_info = await this.getHostInfoImpl(
                        lobby,
                        transactionClient,
                    );

                    const finalInfos: Promise<PlayerInfo>[] = lobby.players.map(
                        async (lobbyPlayer): Promise<PlayerInfo> => {
                            const { is_ready, player_id } = lobbyPlayer;

                            const user = await this.findOneImpl(
                                player_id,
                                transactionClient,
                            );

                            if (!user) {
                                throw new InternalServerErrorException(
                                    `Can't find player of lobby '${lobby.id}' player: '${player_id}'`,
                                );
                            }

                            return {
                                id: player_id,
                                name: user.name,
                                is_ready,
                            };
                        },
                    );

                    const player_infos = await Promise.all(finalInfos);

                    const { id, name, size, gameserver_port } = lobby;

                    return {
                        id,
                        name,
                        size,
                        num_players_in_lobby,
                        host_info,
                        gameserver_port,
                        player_infos,
                    };
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );

            return result;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async deleteIfPossibleAtomic(user: User, lobby_id: string): Promise<void> {
        try {
            await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await this.findOneImpl(
                        lobby_id,
                        transactionClient,
                    );

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status == LobbyStatus.Running) {
                        throw new BadRequestException(
                            `You can't delete the lobby with id ${lobby_id}. Reason: it is currently running`,
                        );
                    }

                    if (user.role != UserRole.Admin) {
                        if (lobby.host_id != user.id) {
                            throw new ForbiddenException(
                                `You can't delete the lobby with id ${lobby_id}. You are not the host`,
                            );
                        }
                    }

                    // NOTE: the lobby player table entries get deleted by the relation action "OnDelete: Cascade"
                    // so no explicit deletion here
                    await transactionClient.lobby.delete({
                        where: { id: lobby_id },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async leaveIfPossibleAtomic(user: User, lobby_id: string): Promise<void> {
        try {
            await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await transactionClient.lobby.findUnique({
                        where: { id: lobby_id },
                        include: { players: true },
                    });

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status != LobbyStatus.Open) {
                        const reason = (() => {
                            switch (lobby.lobby_status) {
                                case LobbyStatus.Closed:
                                    return 'the lobby is already closed';
                                case LobbyStatus.Finished:
                                    return 'the lobby is already finished';
                                case LobbyStatus.Running:
                                    return 'the lobby is currently running';
                                default:
                                    return 'unknown status of the lobby';
                            }
                        })();

                        throw new BadRequestException(
                            `You can't leave the lobby with id ${lobby_id}. Reason: ${reason}`,
                        );
                    }

                    if (lobby.host_id == user.id) {
                        throw new ForbiddenException(
                            `You can't leave the lobby with id ${lobby_id}. You are the host, delete it instead`,
                        );
                    }

                    const lobbyPlayer = lobby.players.find(
                        ({ player_id }) => player_id === user.id,
                    );

                    if (lobbyPlayer === undefined) {
                        throw new ForbiddenException(
                            `You can't leave the lobby with id ${lobby_id}. You are not a player in this lobby`,
                        );
                    }

                    //NOTE: this deletes a relation and remove that from the array
                    //TODO: check if it is done correctly
                    await transactionClient.lobby.update({
                        where: { id: lobby_id },
                        data: {
                            players: {
                                delete: {
                                    player_id: user.id,
                                },
                            },
                            lobby_status: LobbyStatus.Closed,
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    private async startLobbyIfPossibleAtomic(
        user: User,
        lobby_id: string,
    ): Promise<void> {
        try {
            await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await transactionClient.lobby.findUnique({
                        where: { id: lobby_id },
                        include: { players: true },
                    });

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status != LobbyStatus.Open) {
                        const reason = (() => {
                            switch (lobby.lobby_status) {
                                case LobbyStatus.Closed:
                                    return 'the lobby is already closed';
                                case LobbyStatus.Finished:
                                    return 'the lobby is already finished';
                                case LobbyStatus.Running:
                                    return 'the lobby is currently running';
                                default:
                                    return 'unknown status of the lobby';
                            }
                        })();

                        throw new BadRequestException(
                            `You can't start the lobby with id ${lobby_id}. Reason: ${reason}`,
                        );
                    }

                    if (lobby.host_id != user.id) {
                        throw new ForbiddenException(
                            `You can't start the lobby with id ${lobby_id}. You are not the host`,
                        );
                    }

                    for (const lobbyPlayer of lobby.players) {
                        if (!lobbyPlayer.is_ready) {
                            // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/425
                            throw new HttpException(
                                'Not all players are ready yet',
                                425,
                            ); // HttpStatus.TOO_EARLY
                        }
                    }

                    await transactionClient.lobby.update({
                        where: { id: lobby_id },
                        data: {
                            lobby_status: LobbyStatus.Running,
                            //TODO: this is to see, when it started, the legacy API doesn't do that, but I find it a good idea
                            timestamp: new Date(),
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async startIfPossibleAtomic(
        user: User,
        lobby_id: string,
        gameServerCallback: GameServerCallback,
    ): Promise<StartResponse> {
        await this.startLobbyIfPossibleAtomic(user, lobby_id);

        try {
            const port = await gameServerCallback.getPort();

            const playerCount = await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await this.findOneImpl(
                        lobby_id,
                        transactionClient,
                    );

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status != LobbyStatus.Running) {
                        const reason = (() => {
                            switch (lobby.lobby_status) {
                                case LobbyStatus.Closed:
                                    return 'the lobby is already closed';
                                case LobbyStatus.Finished:
                                    return 'the lobby is already finished';
                                case LobbyStatus.Open:
                                    return 'the lobby is currently open';
                                default:
                                    return 'unknown status of the lobby';
                            }
                        })();

                        throw new BadRequestException(
                            `You can't start the lobby with id ${lobby_id}. Reason: While doing step 2: ${reason}`,
                        );
                    }

                    if (lobby.gameserver_port !== null) {
                        throw new ForbiddenException(
                            `You can't start the lobby with id ${lobby_id}. Step 2: The game server is already running`,
                        );
                    }

                    const finalLobby = await transactionClient.lobby.update({
                        where: { id: lobby_id },
                        data: {
                            gameserver_port: port,
                        },
                        include: { _count: true },
                    });

                    return this.getPlayerNumberInLobbyWithoutTransaction(
                        finalLobby,
                    );
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );

            await gameServerCallback.start(port, playerCount);

            return { port };
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async createAtomic(
        user: User,
        data: CreateLobbyRequest,
    ): Promise<LobbyCreationResponse> {
        try {
            const new_lobby = await this.prisma.$transaction(
                async (transactionClient) => {
                    const userIsInLobby = await this.isUserInLobbyImpl(
                        user,
                        transactionClient,
                    );

                    if (userIsInLobby !== null) {
                        throw new BadRequestException(
                            'This user is already inside another lobby',
                        );
                    }

                    return transactionClient.lobby.create({
                        data: {
                            lobby_status: 'Open',
                            name: data.name,
                            size: data.size,
                            host_id: user.id,
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );

            return { id: new_lobby.id };
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async readyPlayerAtomic(user: User, lobby_id: string): Promise<void> {
        try {
            await this.prisma.$transaction(
                async (transactionClient) => {
                    const lobby = await transactionClient.lobby.findUnique({
                        where: { id: lobby_id },
                        include: { players: true },
                    });

                    if (!lobby) {
                        throw new NotFoundException(
                            `there is no lobby with id ${lobby_id}`,
                        );
                    }

                    if (lobby.lobby_status != LobbyStatus.Open) {
                        const reason = (() => {
                            switch (lobby.lobby_status) {
                                case LobbyStatus.Closed:
                                    return 'the lobby is already closed';
                                case LobbyStatus.Finished:
                                    return 'the lobby is already finished';
                                case LobbyStatus.Running:
                                    return 'the lobby is currently running';
                                default:
                                    return 'unknown status of the lobby';
                            }
                        })();

                        throw new BadRequestException(
                            `You can't set yourself ready for the lobby with id ${lobby_id}. Reason: ${reason}`,
                        );
                    }

                    if (lobby.host_id == user.id) {
                        throw new ForbiddenException(
                            `You can't set yourself ready for the lobby with id ${lobby_id}. You are the host, you are already ready`,
                        );
                    }

                    const lobbyPlayer = lobby.players.find(
                        ({ player_id }) => player_id === user.id,
                    );

                    if (lobbyPlayer === undefined) {
                        throw new ForbiddenException(
                            `You can't set yourself ready for the lobby with id ${lobby_id}. You are not a player in this lobby`,
                        );
                    }

                    await transactionClient.lobbyPlayer.update({
                        where: { player_id: user.id, lobby_id: lobby.id },
                        data: {
                            is_ready: true,
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(err.message);
            }

            if (err instanceof Error) {
                throw new InternalServerErrorException(err.message);
            }

            throw new InternalServerErrorException(
                `An unknown error occurred, while trying to read the database`,
            );
        }
    }

    async delete(id: string): Promise<Lobby | null> {
        try {
            return await this.prisma.lobby.delete({ where: { id } });
        } catch (_e) {
            return null;
        }
    }
}
