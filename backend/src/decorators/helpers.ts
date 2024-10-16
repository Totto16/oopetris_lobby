import { ValidateIf } from 'class-validator';

export const ValidateIfDefined = (): PropertyDecorator => ValidateIf((object, value) => value !== undefined);
