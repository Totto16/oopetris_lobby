import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [ConfigModule],
    providers: [PrismaService],
    controllers: [],
    exports: [PrismaService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PrismaModule {}
