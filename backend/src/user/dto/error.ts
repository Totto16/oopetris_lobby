import { HttpStatus } from '@nestjs/common';

export class ErrorDto<T extends HttpStatus> {
    error!: string;
    statusCode!: T;
}

export class ValidatorErrorDto<T extends HttpStatus> {
    message!: string[];
    error!: string;
    statusCode!: T;
}
