/** Compatibility types from the obpf lobby
 *
 * @see https://github.com/OpenBrickProtocolFoundation/lobby/tree/b6eb82abe014de3caf7573b32a79eee609326fb0
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export const commit = 'b6eb82abe014de3caf7573b32a79eee609326fb0';

export class User {
    @IsString()
    id!: string;

    @IsString()
    @MaxLength(80)
    username!: string;

    @IsString()
    @MaxLength(120)
    password!: string;
}

export interface LobbyPlayer {
    id: string;
    is_ready: boolean;
}

export interface Lobby {
    id: string;
    name: string;
    size: number;
    host_id: string;
    timestamp: Date;
    players: LobbyPlayer[];
    gameserver_port?: number | null | undefined;
}

export interface JwtPayload {
    user_id: string;
}

export interface HostInfo {
    id: string;
    name: string;
}

export interface PlayerInfo {
    id: string;
    name: string;
    is_ready: boolean;
}

export interface UserList {
    users: PlayerInfo[];
}

export class Credentials {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}

export class RegisterRequest {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}

export class LoginResponse {
    @ApiProperty({
        description: 'The access token to use as Bearer Auth',
    })
    @IsString()
    jwt!: string;
}

export interface LobbyInfoReturnValue {
    id: string;
    name: string;
    size: number;
    num_players_in_lobby: number;
    host_info: HostInfo;
}

export interface LobbyListResponse {
    lobbies: LobbyInfoReturnValue[];
}

export interface LobbyResponse {
    name: string;
    size: number;
    host_info: HostInfo;
    player_infos: PlayerInfo[];
    gameserver_port: number | null;
}

export interface StartResponse {
    port: number;
}

export class CreateLobbyRequest {
    @IsString()
    name!: string;

    @IsNumber()
    size!: number;
}

export interface LobbyCreationResponse {
    id: string;
}

export interface SetClientReadyResponse{
    port: number
}
