import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    HttpException,
    HttpCode,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from './dto/sign-up';
import { AdminOnly, Public } from '@decorators/all';
import {
    ApiBearerAuth,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { SignInDto } from './dto/sign-in';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { type JWTResponse } from '@oopetris_lobby/shared';
import { JWTResponseDTO } from './dto/token';
import { ValidatorErrorDto } from '../common/dto';

@ApiTags('user')
@Controller({ version: '2', path: 'user' })
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @ApiResponse({
        status: HttpStatus.OK,
        description:
            'The credentials were correct and a user token was returned.',
        type: JWTResponseDTO,
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
    async signIn(@Body() signInDto: SignInDto): Promise<JWTResponse> {
        return this.authService.signIn(signInDto);
    }

    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The user has successfully signed up.',
        schema: { nullable: true, type: getSchemaPath(User) },
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
    @HttpCode(HttpStatus.CREATED)
    @Post('create')
    async signUp(@Body() signUpDto: SignUpDto): Promise<User> {
        const temp = await this.userService.signUp(signUpDto);
        if (temp instanceof PrismaClientKnownRequestError) {
            throw new HttpException(
                `couldn't create user: ${PrismaService.getErrorMessage(temp)}`,
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        return temp;
    }

    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The token was correct and the user was returned.',
        schema: { nullable: true, type: getSchemaPath(User) },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'The token was incorrect',
        type: ValidatorErrorDto<HttpStatus.UNAUTHORIZED>,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: "The user couldn't be found",
        type: ValidatorErrorDto<HttpStatus.BAD_REQUEST>,
    })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get('self')
    getSelf(@Req() req: AuthenticatedRequest): User {
        return req.user.user;
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.OK)
    @Get('all')
    async findAll(): Promise<User[] | null> {
        return this.userService.findAll();
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.OK)
    @Get('find/:id')
    async findOne(@Param('id') id: string): Promise<User | null> {
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.OK)
    @Get('username/:username')
    async findOneByUsername(
        @Param('username') username: string,
    ): Promise<User | null> {
        return this.userService.findOneByUsername(username);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Patch()
    async update(
        @Req() req: AuthenticatedRequest,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User | null> {
        return this.userService.update(req.user.user.id, updateUserDto);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.OK)
    @Patch(':id')
    async updateOther(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User | null> {
        return this.userService.update(id, updateUserDto);
    }

    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Delete('')
    async delete(@Req() req: AuthenticatedRequest): Promise<User | null> {
        return this.userService.delete(req.user.user.id);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async deleteOther(@Param('id') id: string): Promise<User | null> {
        return this.userService.delete(id);
    }
}
