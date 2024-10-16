import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { EnvironmentConfig } from './environment';
import type { Config } from './schema';

export interface GlobalConfig {
    environment: EnvironmentConfig;
    config: Config;
}

// This is a singleton, that can be injected everywhere, and has the same config for all of the injected classes
@Injectable()
export class ConfigService {
    private _config: GlobalConfig;

    private static _instance: ConfigService;

    constructor(config?: GlobalConfig) {
        if (ConfigService._instance) {
            return ConfigService._instance;
        }
        ConfigService._instance = this;

        if (!config) {
            throw new Error(
                'Global Instance of the ConfigService needs a config as parameter to its constructor',
            );
        }

        this._config = config;
    }

    get config(): GlobalConfig {
        return this._config;
    }
}
