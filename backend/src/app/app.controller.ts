import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly, Public } from '@decorators/all';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('general')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('healthcheck')
    healthCheck(): { date: Date } {
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
