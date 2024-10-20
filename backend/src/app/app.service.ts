import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { type DbHealth, PrismaService } from '../prisma/prisma.service';

export interface HealthCheck {
    date: Date;
    db: DbHealth;
}

export type SupportedVersion = 'legacy' | 'modern';

export interface SupportedEndpoints {
    version: SupportedVersion;
    path: string;
}

export interface SupportedAPI {
    user: SupportedEndpoints[];
    lobby: SupportedEndpoints[];
}

export interface ServerInfo {
    supported_api: SupportedAPI;
}

@Injectable()
export class AppService implements OnModuleDestroy {
    private shutdownListener$ = new Subject<void>();

    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
    ) {}

    onModuleDestroy(): void {
        if (this.configService.config.environment.env_type === 'prod') {
            // in the prod environment, Logger.log is not displayed, so using the console
            console.log('Executing OnDestroy Hook');
        } else {
            Logger.log('Executing OnDestroy Hook', 'Destroy');
        }
    }

    subscribeToShutdown(shutdownFn: () => void | Promise<void>): void {
        this.shutdownListener$.subscribe(() => void shutdownFn());
    }

    async healthCheck(): Promise<HealthCheck> {
        const dbHealth = await this.prismaService.getHealthStatus();
        return { date: new Date(), db: dbHealth };
    }

    getInfo(): ServerInfo {
        return {
            supported_api: {
                lobby: [{ path: 'v1', version: 'legacy' }],
                user: [
                    { path: 'v1', version: 'legacy' },
                    { path: 'v2', version: 'modern' },
                ],
            },
        };
    }

    shutdown(): void {
        this.shutdownListener$.next();
    }
}
