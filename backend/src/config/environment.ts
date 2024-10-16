import { error, success, type ErrorOr } from 'src/common/error';

export type EnvType = 'dev' | 'prod';

export interface EnvironmentConfig {
    env_type: EnvType;
    database_url: string;
    config_path: string;
}

function getEnvType(): EnvType {
    const node_env = process.env.NODE_ENV;
    if (node_env === undefined) {
        return 'dev';
    }

    return ['production', ' prod'].includes(node_env) ? 'prod' : 'dev';
}

export async function getEnvironmentConfig(): Promise<
    ErrorOr<EnvironmentConfig>
> {
    const env_type = getEnvType();

    const database_url = process.env.DATABASE_URL;

    if (database_url === undefined || database_url.length === 0) {
        return error("Environment variables 'DATABASE_URL' not specified");
    }

    const config_path = process.env.CONFIG_PATH;

    if (config_path === undefined || config_path.length === 0) {
        return error("Environment variables 'CONFIG_PATH' not specified");
    }

    const result: EnvironmentConfig = {
        env_type,
        database_url,
        config_path,
    };

    return success(result);
}
