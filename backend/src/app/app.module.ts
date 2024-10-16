import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { globalProviders } from '../helpers';

@Module({
    imports: [PrismaModule, UserModule],
    providers: [AppService, ...globalProviders],
    controllers: [AppController],
})
export class AppModule {}
