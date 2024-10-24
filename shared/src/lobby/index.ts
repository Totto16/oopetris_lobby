export const LobbyStatus = {
    Open: 'Open',
    Closed: 'Closed',
    Running: 'Running',
    Finished: 'Finished',
} as const;

export type LobbyStatus = (typeof LobbyStatus)[keyof typeof LobbyStatus];

export interface LobbyBase {
    id: string;
    name: string;
    size: number;
    host_id: string;
    timestamp: Date;
    gameserver_port: number | null;
    lobby_status: LobbyStatus;
}

export interface LobbyPlayerBase {
    player_id: string;
    lobby_id: string;
    is_ready: boolean;
}
