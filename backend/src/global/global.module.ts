import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    secret: configService.config.config.jwt_secret,
                    //TODO: maybe make changeable
                    signOptions: { expiresIn: '7d', algorithm: 'HS256' },
                };
            },
        }),
    ],
    exports: [JwtModule],
})
export class GlobalModule {}
