import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { globalProviders, jwtImport } from '../helpers';

@Module({
    imports: [UsersModule, jwtImport],
    providers: [...globalProviders],
    exports: [AuthService],
})
export class AuthModule {}
