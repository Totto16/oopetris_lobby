import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from '../auth/auth.service';
import { globalProviders, jwtImport } from '../helpers';

@Module({
    controllers: [UsersController],
    providers: [UsersService, AuthService, ...globalProviders],
    imports: [PrismaModule, jwtImport],
})
export class UsersModule {}
