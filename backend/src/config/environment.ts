import { error, success, type ErrorOr } from '../common/error';

export type EnvType = 'dev' | 'prod';

export interface EnvironmentConfig {
    env_type: EnvType;
    database_url: string;
    config_path: string;
    port: number;
    gameserver_executable: string;
    gamserver_cwd: string | undefined;
}

function getEnvType(): EnvType {
    const node_env = process.env.NODE_ENV;
    if (node_env === undefined) {
        return 'dev';
    }

    return ['production', ' prod'].includes(node_env) ? 'prod' : 'dev';
}

function getPort(defaultPort = 3000): number {
    const port = process.env.PORT;
    if (port === undefined) {
        return defaultPort;
    }

    try {
        const portNumber = parseInt(port);

        if (isNaN(portNumber)) {
            return defaultPort;
        }
        return portNumber;
    } catch (_e) {
        return defaultPort;
    }
}

export function getEnvironmentConfig(): ErrorOr<EnvironmentConfig> {
    const env_type = getEnvType();

    const database_url = process.env.DATABASE_URL;

    if (database_url === undefined || database_url.length === 0) {
        return error("Environment variables 'DATABASE_URL' not specified");
    }

    const config_path = process.env.CONFIG_PATH;

    if (config_path === undefined || config_path.length === 0) {
        return error("Environment variables 'CONFIG_PATH' not specified");
    }

    const port = getPort();

    const gameserver_executable = process.env.OBPF_GAMESERVER_EXECUTABLE;

    if (
        gameserver_executable === undefined ||
        gameserver_executable.length === 0
    ) {
        return error(
            "Environment variables 'OBPF_GAMESERVER_EXECUTABLE' not specified",
        );
    }

    const gamserver_cwd = process.env.OBPF_GAMSERVER_CWD;

    const result: EnvironmentConfig = {
        env_type,
        database_url,
        config_path,
        port,
        gameserver_executable,
        gamserver_cwd,
    };

    return success(result);
}
