import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();
    });

    describe('health check', () => {
        it('should return a date in the future', () => {
            const appController = app.get<AppController>(AppController);
            const now = new Date();
            const result = appController.healthCheck();
            expect(now.getTime()).toBeLessThanOrEqual(result.date.getTime());
        });
    });
});
