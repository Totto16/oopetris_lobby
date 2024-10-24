import { HttpStatusCode } from '@angular/common/http';

export interface ErrorDto<T extends HttpStatusCode> {
    error: string;
    statusCode: T;
}

export interface ValidatorErrorDto<T extends HttpStatusCode> {
    message: string[];
    error: string;
    statusCode: T;
}
