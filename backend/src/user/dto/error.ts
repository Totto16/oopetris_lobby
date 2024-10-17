import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class ErrorDto<T extends HttpStatus> {
    error!: string;
    statusCode!: T;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class ValidatorErrorDto<T extends HttpStatus> {
    message!: string[];
    error!: string;
    statusCode!: T;
}
