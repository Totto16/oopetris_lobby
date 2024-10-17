import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';

describe('AppController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [AppController],
            providers: [ConfigService, PrismaService, AppService],
        }).compile();
    });

    describe('health check', () => {
        it('should return a date in the future', async () => {
            const appController = app.get<AppController>(AppController);
            const now = new Date();
            const result = await appController.healthCheck();
            expect(now.getTime()).toBeLessThanOrEqual(result.date.getTime());
        });
    });
});
