import {
    UserRole,
    UserBase,
    UserSignInBase,
    UserSignUpBase,
} from '@oopetris_lobby/shared';
/*
export interface CreateItem extends CreateItemBase {
    status?: ItemStatus;
    title: string;
    content?: string;
    priority?: number;
}

export interface Item extends ItemBase {
    id: string;
    status: ItemStatus;
    title: string;
    content?: string;
    authorId: string;
    priority: number;
}
 */
export interface User extends UserBase {
    id: string;
    username: string;
    password: string;
    role: UserRole;
}

export interface UserSignUp extends UserSignUpBase {
    username: string;
    password: string;
    passwordConfirm: string;
}

export interface UserSignIn extends UserSignInBase {
    username: string;
    password: string;
}
