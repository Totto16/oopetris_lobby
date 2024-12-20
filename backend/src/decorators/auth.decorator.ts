import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from '@oopetris_lobby/shared';

export const ROLES_KEY = Symbol('rolesKey');
export const OnlyAllowRoles = (
    roles: UserRole[],
): CustomDecorator<typeof ROLES_KEY> => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => OnlyAllowRoles([UserRole.Admin]);
