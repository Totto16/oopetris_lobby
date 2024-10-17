import { ValidateIf } from 'class-validator';

export const ValidateIfDefined = (): PropertyDecorator =>
    ValidateIf((_object, value) => value !== undefined);
