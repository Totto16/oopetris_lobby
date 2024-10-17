import { Module } from '@nestjs/common';

import {
    AppController,
    AppControllerV1,
    AppControllerV2,
} from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { globalProviders } from '../helpers';
import { GlobalModule } from 'src/global/global.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
    imports: [GlobalModule, ConfigModule, PrismaModule, UserModule],
    providers: [AppService, ...globalProviders],
    controllers: [AppController, AppControllerV1, AppControllerV2],
})
export class AppModule {}
