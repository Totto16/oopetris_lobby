import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { validate } from 'class-validator';
import { User } from './entities/user.entity';
import { compareSync } from 'bcrypt';
import type { JWTResponse } from '@shared/user';

const USERNAME = 'testController4';
const PASSWORD = 'f67F86n9gf97oidvl%%';

describe('UserController', () => {
    let controller: UserController;

    let app: INestApplication;

    async function getToken(password?: string): Promise<string> {
        let userToken: string | null = null;
        while (userToken === null) {
            const res = await supertest(app.getHttpServer())
                .post('/user/login')
                .send({
                    username: USERNAME,
                    password: password ?? PASSWORD,
                });
            if (res.statusCode !== 200) {
                userToken = null;
                await sleep(10);
                continue;
            }

            userToken = (res.body as JWTResponse).access_token;
        }

        return userToken;
    }
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [jwtImport],
            controllers: [UserController],
            providers: [UserService, PrismaService, AuthService],
        }).compile();

        controller = module.get<UserController>(UserController);

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        const prisma = module.get<PrismaService>(PrismaService);
        await prisma.user.deleteMany({ where: { username: USERNAME } });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('when registering', () => {
        describe('and using valid data', () => {
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        haha: 'xD',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            'username should not be null or undefined',
                            'username must be shorter than or equal to 20 characters',
                            'username must be longer than or equal to 4 characters',
                            'username must be a string',
                            'password should not be null or undefined',
                            'password too weak',
                            'password must be shorter than or equal to 30 characters',
                            'password must be longer than or equal to 8 characters',
                            'password must be a string',
                            'passwordConfirm should not be null or undefined',
                            'passwordConfirm must be shorter than or equal to 30 characters',
                            'passwordConfirm must be longer than or equal to 8 characters',
                            'passwordConfirm must be a string',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
        });

        describe('and using invalid data', () => {
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: '1',
                        password: 'UOBPTgn)/01',
                        passwordConfirm: 'UOBPTgn)/01',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            'username must be longer than or equal to 4 characters',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
        });

        describe('and using valid data', () => {
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username:
                            '1svdfsvyffffffffffffffffffftertgfvcBZFNUKSDJHSFJSJFV',
                        password: 'UOBPTgn)/01',
                        passwordConfirm: 'UOBPTgn)/01',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            'username must be shorter than or equal to 20 characters',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });

            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: 'test123',
                        password: '1',
                        passwordConfirm: '1',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            'password too weak',
                            'password must be longer than or equal to 8 characters',
                            'passwordConfirm must be longer than or equal to 8 characters',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: 'test123',
                        password:
                            'ZUIBFUZFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF%(&g4rb6RKNHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
                        passwordConfirm:
                            'ZUIBFUZFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF%(&g4rb6RKNHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            'password must be shorter than or equal to 30 characters',
                            'passwordConfirm must be shorter than or equal to 30 characters',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: 'test123',
                        password: 'dffdfwqfas',
                        passwordConfirm: 'dffdfwqfas',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: ['password too weak'],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
            it('should return the correct error', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: 'test123',
                        password: 'f67F86n9gf97oidvl%%',
                        passwordConfirm: 'wrw',
                    })
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect({
                        message: [
                            "The value of 'password' should match the value of passwordConfirm: '*******************' !== '***'",
                            'passwordConfirm must be longer than or equal to 8 characters',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
            });
        });

        describe('and using valid data', () => {
            it('should succeed', () => {
                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: USERNAME,
                        password: PASSWORD,
                        passwordConfirm: PASSWORD,
                    })
                    .expect(HttpStatus.CREATED)
                    .then(async (response) => {
                        const user: User = response.body as User;
                        expect(user).toBeInstanceOf(Object);
                        await expect(validate(user)).resolves.toStrictEqual([]);

                        expect(user).not.toBeNull();
                        expect(user).not.toBeUndefined();

                        expect(ObjectId.isValid(user.id)).toStrictEqual(true);
                        expect(user.username).toStrictEqual(USERNAME);
                        expect(
                            compareSync(PASSWORD, user.password),
                        ).toStrictEqual(true);
                        expect(user.role).toStrictEqual(UserRole.User);
                    });
            });

            it('should fail to create a user with the same username', async () => {
                await getToken();

                return supertest(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        username: USERNAME,
                        password: 'sguvkjfvSDGSD%%',
                        passwordConfirm: 'sguvkjfvSDGSD%%',
                    })
                    .expect(HttpStatus.UNPROCESSABLE_ENTITY)
                    .expect({
                        statusCode: 422,
                        message:
                            "couldn't create user: There is a unique constraint violation: field 'User_username_key' has to be unique",
                    });
            });

            it('should get an user from an access token', async () => {
                const token = await getToken();

                return supertest(app.getHttpServer())
                    .post('/user/token')
                    .send({
                        token,
                    })
                    .expect(HttpStatus.OK)
                    .then(async (response) => {
                        const user: User = response.body as User;
                        expect(user).toBeInstanceOf(Object);
                        await expect(validate(user)).resolves.toStrictEqual([]);

                        expect(user).not.toBeNull();
                        expect(user).not.toBeUndefined();

                        expect(ObjectId.isValid(user.id)).toStrictEqual(true);
                        expect(user.username).toStrictEqual(USERNAME);
                        expect(
                            compareSync(PASSWORD, user.password),
                        ).toStrictEqual(true);
                        expect(user.role).toStrictEqual(UserRole.User);
                    });
            });

            it('should get all user', async () => {
                const token = await getToken();

                return supertest(app.getHttpServer())
                    .get('/user/all')
                    .set('Authorization', `Bearer ${token}`)
                    .send()
                    .expect(HttpStatus.OK)
                    .then(async (response) => {
                        const user: User[] = response.body as User[];
                        expect(user).toBeInstanceOf(Array);
                        for (const user of user) {
                            await expect(validate(user)).resolves.toStrictEqual(
                                [],
                            );
                            expect(user).not.toBeNull();
                            expect(user).not.toBeUndefined();
                            expect(ObjectId.isValid(user.id)).toStrictEqual(
                                true,
                            );
                        }
                    });
            });

            it('should return error when trying to get invalid user', async () => {
                const token = await getToken();

                return supertest(app.getHttpServer())
                    .get(`/user/find/${new ObjectId().toString()}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send()
                    .expect(HttpStatus.OK)
                    .then((response) => {
                        expect(response.body).toStrictEqual({});
                    });
            });

            it('should get the correct user', async () => {
                const token = await getToken();

                const user: User = (
                    await supertest(app.getHttpServer())
                        .post('/user/token')
                        .send({
                            token,
                        })
                ).body as User;

                return supertest(app.getHttpServer())
                    .get(`/user/find/${user.id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send()
                    .expect(HttpStatus.OK)
                    .then(async (response) => {
                        const user2: User = response.body as User;
                        await expect(validate(user)).resolves.toStrictEqual([]);
                        expect(user).toStrictEqual(user2);
                    });
            });
        });

        it('should be able to edit the user', async () => {
            const token = await getToken();

            const user: User = (
                await supertest(app.getHttpServer()).post('/user/token').send({
                    token,
                })
            ).body as User;

            user.role = UserRole.Admin;

            return supertest(app.getHttpServer())
                .patch(`/user/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: user.role })
                .expect(HttpStatus.OK)
                .then(async (response) => {
                    const user2: User = response.body as User;
                    await expect(validate(user)).resolves.toStrictEqual([]);
                    expect(user).toStrictEqual(user2);
                    expect(user.role).toStrictEqual(UserRole.Admin);
                });
        });

        it('should be able to edit the user password', async () => {
            const token = await getToken();

            const user: User = (
                await supertest(app.getHttpServer()).post('/user/token').send({
                    token,
                })
            ).body as User;

            user.role = UserRole.Admin;

            return supertest(app.getHttpServer())
                .patch(`/user/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: user.role, password: PASSWORD + 's' })
                .expect(HttpStatus.OK)
                .then(async (response) => {
                    const user2: User = response.body as User;
                    await expect(validate(user)).resolves.toStrictEqual([]);
                    expect({ ...user, password: PASSWORD }).toStrictEqual({
                        ...user2,
                        password: PASSWORD,
                    });
                    expect(user.role).toStrictEqual(UserRole.Admin);
                    expect(
                        compareSync(PASSWORD + 's', user2.password),
                    ).toStrictEqual(true);
                });
        });

        it('should fail to delete an non-existent user', async () => {
            const token = await getToken(PASSWORD + 's');

            return supertest(app.getHttpServer())
                .delete(`/user/${new ObjectId().toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.OK)
                .then((response) => {
                    expect(response.body).toStrictEqual({});
                });
        });

        it('should be able to delete the user', async () => {
            const token = await getToken(PASSWORD + 's');
            const user: User = (
                await supertest(app.getHttpServer()).post('/user/token').send({
                    token,
                })
            ).body as User;

            return supertest(app.getHttpServer())
                .delete(`/user/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.OK)
                .then(async (response) => {
                    const user2: User = response.body as User;
                    await expect(validate(user)).resolves.toStrictEqual([]);
                    expect(user).toStrictEqual(user2);

                    const res = await supertest(app.getHttpServer())
                        .post('/user/token')
                        .send({
                            token,
                        });

                    expect(res.statusCode).toStrictEqual(200);

                    expect(res.body).toStrictEqual({});
                });
        });
    });
});
