import {
    Controller,
    Get,
    Post,
    Body,
    HttpStatus,
    HttpException,
    HttpCode,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from '@decorators/all';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidatorErrorDto } from './dto/error';
import { AuthService } from '../auth/auth.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequest } from 'src/auth/auth.guard';
import {
    LoginResponse,
    type Credentials,
    type PlayerInfo,
    type RegisterRequest,
    type UserList,
} from 'src/compatibility';

@ApiTags('user')
@Controller({ version: '1' })
export class LegacyUserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @ApiResponse({
        status: HttpStatus.OK,
        description:
            'The credentials were correct and a user token was returned.',
        type: LoginResponse,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'The credentials were incorrect',
        type: ValidatorErrorDto<HttpStatus.UNAUTHORIZED>,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: "The user couldn't be found",
        type: ValidatorErrorDto<HttpStatus.BAD_REQUEST>,
    })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() credentials: Credentials): Promise<LoginResponse> {
        return this.authService.legacySignIn(credentials);
    }

    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The user has successfully signed up.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            "The username or passwords aren't conform or other validations failed",
        type: ValidatorErrorDto<HttpStatus.BAD_REQUEST>,
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'The username is already present',
        type: ValidatorErrorDto<HttpStatus.UNPROCESSABLE_ENTITY>,
    })
    @Public()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('register')
    async signUp(@Body() signUpDto: RegisterRequest): Promise<void> {
        const temp = await this.userService.signUp(signUpDto);
        if (temp instanceof PrismaClientKnownRequestError) {
            throw new HttpException(
                `couldn't create user: ${PrismaService.getErrorMessage(temp)}`,
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Get('users')
    async findAll(): Promise<UserList> {
        const rawUsers = await this.userService.findAll();

        if (!rawUsers) {
            return { users: [] };
        }

        const users: PlayerInfo[] = rawUsers.map(({ id, username }) => ({
            id,
            name: username,
            is_ready: false,
        }));

        return { users };
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('unregister')
    async unregister(@Req() req: AuthenticatedRequest): Promise<void> {
        await this.userService.delete(req.user.user.id);
    }
}
