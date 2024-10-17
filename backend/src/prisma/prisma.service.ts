import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '../config/config.service';

export type DbStatus = 'ok' | 'error';
export interface DbHealth {
    status: DbStatus;
}

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
        await this.$connect();
    }

    async getHealthStatus(): Promise<DbHealth> {
        try {
            const _result = await this.$queryRaw`SELECT 1`;
            return { status: 'ok' };
        } catch (_e) {
            return { status: 'error' };
        }
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
