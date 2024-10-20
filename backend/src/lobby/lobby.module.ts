import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { globalProviders } from '../helpers';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { LobbyService } from './lobby.service';
import { LegacyLobbyController } from './legacy.lobby.controller';
import { GameServerService } from './game.server.service';

@Module({
    controllers: [LegacyLobbyController],
    providers: [LobbyService, GameServerService, ...globalProviders],
    imports: [ConfigModule, PrismaModule, UserModule],
    exports: [LobbyService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LobbyModule {}
