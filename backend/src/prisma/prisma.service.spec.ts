import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '../config/config.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeAll(async () => {
        const app = await NestFactory.create(PrismaModule, { logger: false });

        // deal with shutdown hooks
        app.enableShutdownHooks();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConfigService, PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
