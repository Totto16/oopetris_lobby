import { inject } from '@angular/core';
import {
    HttpRequest,
    HttpEvent,
    type HttpHandlerFn,
    HttpContextToken,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './constants';
import { UserV2Service } from '../services/user.service';

export const AUTH_ENABLED = new HttpContextToken<boolean>(() => true);

export function authInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    if (!request.context.get(AUTH_ENABLED)) {
        return next(request);
    }

    const authToken = inject(UserV2Service).token;

    // add auth header with jwt if user is logged in AND request is to the api url
    const isApiUrl = request.url.startsWith(API_URL);
    if (authToken !== null && isApiUrl) {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${authToken}`,
            },
        });
    }

    return next(request);
}
