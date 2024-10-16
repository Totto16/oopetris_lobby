import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LogLevel, Logger, ValidationPipe } from '@nestjs/common';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppService } from './app/app.service';
import { currentVersion } from './common/common';
import { ConfigModule } from './config/config.module';
import { getError, getResult, isError } from './common/error';

async function bootstrap(): Promise<void> {
    let loggerSettings: LogLevel[] | undefined = undefined;

    const parsedConfig = await ConfigModule.setup();

    if (isError(parsedConfig)) {
        console.error(
            `Error while initializing the config: ${getError(parsedConfig)}!`,
        );
        process.exit(1);
    }

    const {
        environment: { env_type, port },
    } = getResult(parsedConfig);

    if (env_type === 'prod') {
        loggerSettings = ['error'];
    }

    const app = await NestFactory.create(AppModule, { logger: loggerSettings });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new ValidationPipe());

    if (env_type === 'dev') {
        const config = new DocumentBuilder()
            .addBearerAuth()
            .setTitle('OOPetris Lobby Server')
            .setDescription('A Lobby Server for OOPetris')
            .setVersion(currentVersion)
            .build();

        const options: SwaggerDocumentOptions = {
            deepScanRoutes: true,
        };

        const document = SwaggerModule.createDocument(app, config, options);

        SwaggerModule.setup('swagger-ui', app, document);
    }

    // deal with shutdown hooks (needed fro prisma)
    app.enableShutdownHooks();

    app.get<AppService>(AppService).subscribeToShutdown(() => app.close());

    await app.listen(port);

    if (env_type === 'prod') {
        console.log(
            `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
        );
    } else {
        Logger.log(
            `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
        );
        Logger.log(
            `🔍 Swagger ui is available at http://localhost:${port}/swagger-ui`,
        );
    }
}

void bootstrap();
