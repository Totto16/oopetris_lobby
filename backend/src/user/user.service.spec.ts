import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { compareSync } from 'bcrypt';
import { isUUID } from 'class-validator';
import { UserRole } from '@shared/user';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { AppModule } from '../app/app.module';

const PASSWORD = 'Test13%';
const USERNAME = 'test3';

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        await ConfigModule.setup();

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [ConfigService, PrismaService, AuthService, UserService],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    afterAll(async () => {
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

    it('should be able to sign up', async () => {
        let user!: User;
        await expect(
            (async (): Promise<User> => {
                const temp = await service.signUp({
                    username: USERNAME,
                    password: PASSWORD,
                    passwordConfirm: PASSWORD,
                });
                if (temp instanceof Error) {
                    throw new Error(`'Unexpected error: ${temp.message}`);
                }
                user = temp;
                return user;
            })(),
        ).resolves.toBeInstanceOf(Object);

        expect(user).not.toBeNull();
        expect(user).not.toBeUndefined();

        expect(isUUID(user.id, '4')).toStrictEqual(true);
        expect(user.username).toStrictEqual(USERNAME);
        expect(compareSync(PASSWORD, user.password)).toStrictEqual(true);
        expect(user.role).toStrictEqual(UserRole.User);
    });
});
