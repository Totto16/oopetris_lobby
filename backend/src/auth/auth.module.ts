import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { globalProviders } from '../helpers';

@Module({
    imports: [UserModule],
    providers: [...globalProviders],
    exports: [AuthService],
})
export class AuthModule {}
