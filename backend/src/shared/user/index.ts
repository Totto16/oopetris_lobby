import { UserRole } from '@prisma/client';
export { UserRole } from '@prisma/client';
export { constants as userConstants } from './constants';
export interface UserBase {
    id: string;
    username: string;
    password: string;
    role: UserRole;
}

export interface UserSignInBase {
    username: string;
    password: string;
}

export interface UserSignUpBase extends UserSignInBase {
    passwordConfirm: string;
}

export interface JWTResponse {
    access_token: string;
}
