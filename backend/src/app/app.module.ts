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
import { GlobalModule } from '../global/global.module';
import { ConfigModule } from '../config/config.module';
import { LobbyModule } from 'src/lobby/lobby.module';

@Module({
    imports: [
        GlobalModule,
        ConfigModule,
        PrismaModule,
        UserModule,
        LobbyModule,
    ],
    providers: [AppService, ...globalProviders],
    controllers: [AppController, AppControllerV1, AppControllerV2],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
