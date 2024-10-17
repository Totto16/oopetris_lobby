import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeAll(async () => {
        await ConfigModule.setup();

        const app = await NestFactory.create(PrismaModule, { logger: false });

        // deal with shutdown hooks
        app.enableShutdownHooks();
    });

    beforeEach(async () => {
        await ConfigModule.setup();

        const module: TestingModule = await Test.createTestingModule({
            providers: [ConfigService, PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
