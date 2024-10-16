import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(private readonly configService: ConfigService) {
        super({
            datasources: {
                db: { url: configService.config.environment.database_url },
            },
        });
    }

    async onModuleInit(): Promise<void> {
        if (
            !this.configService.config.config.database_settings.initialize_lazy
        ) {
            try {
                await this.$connect();
            } catch (err) {
                //TODO: use error interceptors
                Logger.error('Failed to connect to database', err);
                throw new Error('Exiting');
            }
        }
    }

    async getHealthStatus() {
        //TODO
        return true;
    }

    static getErrorMessage(error: PrismaClientKnownRequestError): string {
        switch (error.code) {
            case 'P2002': {
                return `There is a unique constraint violation: field '${(error.meta?.target as string | undefined) ?? 'unknown'}' has to be unique`;
            }
            default:
                return `Unknown error ${error.code} on field '${(error.meta?.target as string | undefined) ?? 'unknown'}'`;
        }
    }
}
