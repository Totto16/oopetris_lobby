import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class AppService implements OnModuleDestroy {
    private shutdownListener$: Subject<void> = new Subject();

    onModuleDestroy(): void {
        //TODO: never log to console
        console.log('Executing OnDestroy Hook');
    }

    subscribeToShutdown(shutdownFn: () => void | Promise<void>): void {
        this.shutdownListener$.subscribe(() => void shutdownFn());
    }

    healthCheck(): { date: Date } {
        //TODO
        return { date: new Date() };
    }

    shutdown(): void {
        this.shutdownListener$.next();
    }
}
