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
