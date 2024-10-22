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
import { PrismaService } from './prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * @description cleanup old Lobbies, this deletes all lobbies and associated lobby players, this is done on startup, so that everything is consistent
 * @param prismaService
 */
async function cleanupLobbies(prismaService: PrismaService): Promise<void> {
    await prismaService.$transaction(
        async (transactionClient) => {
            // delete ALL lobbies
            await transactionClient.lobby.deleteMany({});

            // delete ALL lobby players
            await transactionClient.lobbyPlayer.deleteMany({});
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
    );
}

async function bootstrap(): Promise<void> {
    let loggerSettings: LogLevel[] | undefined = undefined;

    const parsedConfig = await ConfigModule.setup();

    const {
        environment: { env_type, port },
    } = parsedConfig;

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

    const prismaService = app.get<PrismaService>(PrismaService);
    await cleanupLobbies(prismaService);

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
