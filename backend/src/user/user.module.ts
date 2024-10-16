import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from '../auth/auth.service';
import { globalProviders } from '../helpers';
import { ConfigModule } from 'src/config/config.module';

@Module({
    controllers: [UserController],
    providers: [UserService, AuthService, ...globalProviders],
    imports: [ConfigModule, PrismaModule],
    exports: [UserService],
})
export class UserModule {}
