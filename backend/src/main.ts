import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
    LogLevel,
    Logger,
    ValidationPipe,
    VersioningType,
} from '@nestjs/common';
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
        // the logger isn't initialized yet
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

    // see: https://docs.nestjs.com/techniques/versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

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

    // deal with shutdown hooks (needed for prisma)
    app.enableShutdownHooks();

    app.get<AppService>(AppService).subscribeToShutdown(() => app.close());

    try {
        await app.listen(port);
    } catch (err) {
        Logger.error(err);
        await app.close();
        return;
    }

    if (env_type === 'prod') {
        // the loglevel log / info isn't outputted, so force this text, by using console
        console.log(
            `🚀 Application is running on: http://localhost:${port.toString()}/${globalPrefix}`,
        );
    } else {
        Logger.log(
            `🚀 Application is running on: http://localhost:${port.toString()}/${globalPrefix}`,
        );
        Logger.log(
            `🔍 Swagger ui is available at http://localhost:${port.toString()}/swagger-ui`,
        );
    }
}

void bootstrap();
