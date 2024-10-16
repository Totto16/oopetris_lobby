import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { BCRYPT_SALT_AMOUNT } from './constants';
import { User } from './entities/user.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async signUp(
        signUpDto: SignUpDto,
    ): Promise<User | PrismaClientKnownRequestError> {
        const password: string = hashSync(
            signUpDto.password,
            BCRYPT_SALT_AMOUNT,
        );
        const data: Prisma.UserCreateInput = {
            username: signUpDto.username,
            password,
        };

        try {
            const user = await this.prisma.user.create({ data });
            return user;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                return err;
            }

            throw err;
        }
    }

    findAll(): Promise<User[] | null> {
        return this.prisma.user.findMany({});
    }

    findOneByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    findOne(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
        const data: Prisma.UserUpdateInput = { role: updateUserDto.role };
        if (updateUserDto.password !== undefined) {
            data.password = hashSync(
                updateUserDto.password,
                BCRYPT_SALT_AMOUNT,
            );
        }
        return this.prisma.user.update({ where: { id }, data });
    }

    async delete(id: string): Promise<User | null> {
        try {
            return await this.prisma.user.delete({ where: { id } });
        } catch (e) {
            return null;
        }
    }
}
