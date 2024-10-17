import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { ConfigService } from 'src/config/config.service';
import { type DbHealth, PrismaService } from 'src/prisma/prisma.service';

export interface HealthCheck {
    date: Date;
    db: DbHealth;
}

@Injectable()
export class AppService implements OnModuleDestroy {
    private shutdownListener$: Subject<void> = new Subject();

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

    shutdown(): void {
        this.shutdownListener$.next();
    }
}
