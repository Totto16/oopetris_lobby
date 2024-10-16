import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
    imports: [ConfigModule],
    providers: [PrismaService],
    controllers: [],
    exports: [PrismaService],
})
export class PrismaModule {}