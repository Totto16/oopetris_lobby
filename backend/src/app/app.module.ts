import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';
import { globalProviders } from '../helpers';

@Module({
    imports: [PrismaModule, ItemsModule, UsersModule],
    providers: [AppService, ...globalProviders],
    controllers: [AppController],
})
export class AppModule {}
