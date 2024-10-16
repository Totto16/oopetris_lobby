import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Provider } from '@nestjs/common';

export const globalProviders: Provider[] = [
    {
        provide: APP_GUARD,
        useClass: AuthGuard,
    },
];
