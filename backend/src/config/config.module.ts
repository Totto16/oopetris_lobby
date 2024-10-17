import { Module } from '@nestjs/common';

import { ConfigService, type GlobalConfig } from './config.service';
import { readConfig } from './schema';
import {
    error,
    getError,
    getResult,
    isError,
    success,
    type ErrorOr,
} from '../common/error';
import { getEnvironmentConfig } from './environment';

@Module({
    providers: [ConfigService],
    controllers: [],
    exports: [ConfigService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigModule {
    private static _configService: ConfigService;

    static async setup(): Promise<ErrorOr<GlobalConfig>> {
        const environmentOrError = getEnvironmentConfig();

        if (isError(environmentOrError)) {
            return error(`Environment: ${getError(environmentOrError)}`);
        }

        const environment = getResult(environmentOrError);

        const configOrError = await readConfig(environment.config_path);

        if (isError(configOrError)) {
            return error(`File Config: ${getError(configOrError)}`);
        }

        const config = getResult(configOrError);

        const globalConfig: GlobalConfig = {
            environment,
            config,
        };

        ConfigModule._configService = new ConfigService();

        ConfigService.setup(globalConfig);

        return success<GlobalConfig>(globalConfig);
    }
}
