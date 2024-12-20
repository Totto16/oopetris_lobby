import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { sleep, waitUntilDoesNotThrow } from '../test/helpers';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { AppModule } from '../app/app.module';

const PASSWORD = 'Test123$';
const USERNAME = 'test2';

describe('AuthService', () => {
    let service: AuthService;

    async function waitForClear(module: TestingModule): Promise<void> {
        const prismaService = module.get<PrismaService>(PrismaService);

        let user: true | null = true;
        while (user !== null) {
            const temp = await prismaService.user.findUnique({
                where: { username: USERNAME },
                select: { username: true },
            });
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (temp === null || temp === undefined) {
                user = null;
                continue;
            }

            user = true;
            await sleep(10);
        }

        return;
    }

    beforeEach(async () => {
        await ConfigModule.setup();

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [ConfigService, PrismaService, AuthService, UserService],
        }).compile();

        const userService = module.get<UserService>(UserService);
        await waitForClear(module);
        await waitUntilDoesNotThrow(async () => {
            const temp = await userService.signUp({
                username: USERNAME,
                password: PASSWORD,
                passwordConfirm: PASSWORD,
            });
            if (temp instanceof PrismaClientKnownRequestError) {
                throw new Error(
                    `Test setup gone wrong: ${PrismaService.getErrorMessage(temp)}`,
                );
            }
        });

        service = module.get<AuthService>(AuthService);
    });

    afterEach(async () => {
        await ConfigModule.setup();

        const module: TestingModule = await Test.createTestingModule({
            providers: [ConfigService, PrismaService],
        }).compile();

        const prisma = module.get<PrismaService>(PrismaService);
        await prisma.user.deleteMany({ where: { username: USERNAME } });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should be able to sign in', async () => {
        await expect(
            service.signIn({ username: USERNAME, password: PASSWORD }),
        ).resolves.toHaveProperty('access_token');
    });

    it('should reject invalid password', async () => {
        await expect(
            service.signIn({ username: USERNAME, password: 'afasfsaf' }),
        ).rejects.toStrictEqual(new UnauthorizedException('Wrong password'));
    });

    it('should reject invalid user', async () => {
        await expect(
            service.signIn({ username: 'dasfawf', password: 's' }),
        ).rejects.toStrictEqual(new UnauthorizedException('User not found'));
    });
});
