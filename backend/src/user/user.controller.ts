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
import { ValidatorErrorDto } from './dto/error';
import { AuthService, JWTContent } from '../auth/auth.service';
import { SignInDto } from './dto/sign-in';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from 'src/config/config.service';
import type { AuthenticatedRequest } from 'src/auth/auth.guard';
import type { JWTResponse } from '@shared/user';
@ApiTags('user')
@Controller({ version: '2', path: 'user' })
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    @Public()
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
        type: ValidatorErrorDto<HttpStatus.UNAUTHORIZED>,
    })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: SignInDto): Promise<JWTResponse> {
        return this.authService.signIn(signInDto);
    }

    @Public()
    @Post('create')
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
    @HttpCode(HttpStatus.CREATED)
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

    @ApiBearerAuth()
    @AdminOnly()
    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<User[] | null> {
        return this.userService.findAll();
    }

    @ApiBearerAuth()
    @AdminOnly()
    @Get('find/:id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<User | null> {
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @Get('username/:username')
    @HttpCode(HttpStatus.OK)
    async findOneByUsername(
        @Param('username') username: string,
    ): Promise<User | null> {
        return this.userService.findOneByUsername(username);
    }

    @ApiBearerAuth()
    @Patch()
    @HttpCode(HttpStatus.OK)
    async update(
        @Req() req: AuthenticatedRequest,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User | null> {
        return this.userService.update(req.user.user.id, updateUserDto);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updateOther(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User | null> {
        return this.userService.update(id, updateUserDto);
    }

    @ApiBearerAuth()
    @Delete('')
    @HttpCode(HttpStatus.OK)
    async delete(@Req() req: AuthenticatedRequest): Promise<User | null> {
        return this.userService.delete(req.user.user.id);
    }

    @ApiBearerAuth()
    @AdminOnly()
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteOther(@Param('id') id: string): Promise<User | null> {
        return this.userService.delete(id);
    }
}
