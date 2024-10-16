import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = Symbol('rolesKey');
export const OnlyAllowRoles = (
    roles: Role[],
): CustomDecorator<typeof ROLES_KEY> => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => OnlyAllowRoles(Role.Admin);
