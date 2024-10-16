import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = Symbol('isPublic');
export const Public = (): CustomDecorator<typeof IS_PUBLIC_KEY> =>
    SetMetadata(IS_PUBLIC_KEY, true);
