import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { globalProviders } from '../helpers';

@Module({
    imports: [UserModule],
    providers: [...globalProviders],
    exports: [AuthService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
