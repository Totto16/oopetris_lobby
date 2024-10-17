import { Test } from '@nestjs/testing';

import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from 'src/config/config.module';

describe('AppService', () => {
    let service: AppService;

    beforeAll(async () => {
        await ConfigModule.setup();

        const app = await Test.createTestingModule({
            providers: [ConfigService, PrismaService, AppService],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    describe('health check', () => {
        it('should return a date in the future', async () => {
            const now = new Date();
            const result = await service.healthCheck();
            expect(now.getTime()).toBeLessThanOrEqual(result.date.getTime());
        });

        it('should be connected to the db', async () => {
            const result = await service.healthCheck();
            expect(result.db.status).toStrictEqual('ok');
        });
    });
});
