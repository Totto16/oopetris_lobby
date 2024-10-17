import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    VERSION_NEUTRAL,
} from '@nestjs/common';

import { AppService, HealthCheck } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly, Public } from '@decorators/all';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VersionResponse, type APIFeatures } from '@shared/genral';
import { commit as compatibilityCommit } from 'src/compatibility';
import { commit as currentCommit } from 'src/generated/commit';
import { currentVersion } from 'src/common/common';
@ApiTags('general')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('healthcheck')
    async healthCheck(): Promise<HealthCheck> {
        return this.appService.healthCheck();
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('shutdown')
    shutdown(): void {
        return this.appService.shutdown();
    }
}

@ApiTags('general')
@Controller({ version: '1' })
export class AppControllerV1 {
    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('version')
    async version(): Promise<VersionResponse> {
        return {
            version: '0.0.1',
            commit: compatibilityCommit,
            name: 'obpf-lobby',
        };
    }
}

@ApiTags('general')
@Controller({ version: '2' })
export class AppControllerV2 {
    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('version')
    async version(): Promise<VersionResponse> {
        return {
            version: currentVersion,
            commit: currentCommit,
            name: 'oopetris-lobby',
        };
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('features')
    async features(): Promise<APIFeatures> {
        return ['multiplayer'];
    }
}
