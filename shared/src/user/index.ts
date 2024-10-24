export { constants as userConstants } from './constants';

export const UserRole = {
    User: 'User',
    Admin: 'Admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

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
