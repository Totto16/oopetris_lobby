import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
    HttpClient,
    HttpContext,
    HttpErrorResponse,
    HttpStatusCode,
} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { JWTResponse } from '@oopetris_lobby/shared';
import { API_URL as BASE_API_URL } from '@helpers/constants';
import { ErrorDto, ValidatorErrorDto } from '../helpers/errors';
import type { User, UserSignIn, UserSignUp } from '@helpers/entities';
import { AUTH_ENABLED } from '../helpers/jwt.interceptor';

const TOKEN_KEY = 'token';
const REGISTERED_KEY = 'registered_key';

export enum State {
    uninitialized,
    unauthenticated,
    loggedOut,
    loggedIn,
}

const API_URL = `${BASE_API_URL}/v2`;

@Injectable({ providedIn: 'root' })
export class UserV2Service {
    private userSubject: BehaviorSubject<User | null>;
    private tokenSubject: BehaviorSubject<string | null>;
    private _state: BehaviorSubject<State>;

    constructor(
        private readonly router: Router,
        private readonly http: HttpClient,
    ) {
        this.userSubject = new BehaviorSubject<User | null>(null);
        this.tokenSubject = new BehaviorSubject<string | null>(null);
        this._state = new BehaviorSubject<State>(State.uninitialized);
    }

    public get stateValue(): State {
        return this._state.value;
    }

    public get state(): BehaviorSubject<State> {
        void this.fetchState();
        return this._state;
    }

    public get user(): User | null {
        return this.userSubject.value;
    }

    public get userObserver(): Observable<User | null> {
        return this.userSubject.asObservable();
    }

    public get token(): string | null {
        if (this.tokenSubject.value === null) {
            return null;
        }
        return this.tokenSubject.value;
    }

    private async fetchState(): Promise<boolean> {
        const token: string | null = localStorage.getItem(TOKEN_KEY);
        if (token === null) {
            this._state.next(State.unauthenticated);
            return true;
        }

        this.tokenSubject.next(token);

        return await new Promise((resolve) => {
            this.http.get<User>(`${API_URL}/user/self`).subscribe({
                next: (user: User) => {
                    this.userSubject.next(user);
                    this._state.next(State.loggedIn);
                    resolve(true);
                },

                error: (_error: unknown) => {
                    const error = _error as
                        | HttpErrorResponse
                        | ValidatorErrorDto<number>
                        | ErrorDto<number>;

                    const [status, message]: [number, string] =
                        error instanceof HttpErrorResponse
                            ? [error.status, error.message]
                            : [error.statusCode, error.error];

                    if (status === HttpStatusCode.Unauthorized) {
                        this._state.next(State.loggedOut);

                        resolve(false);
                        return;
                    } else if (status >= 500) {
                        this._state.next(State.unauthenticated);

                        resolve(false);
                        return;
                    }

                    throw new Error(`Error in getting the token: ${message}`);
                },
            });
        });
    }

    async login(loginDto: UserSignIn): Promise<void> {
        return await new Promise((resolve, reject) => {
            const context = new HttpContext();
            context.set(AUTH_ENABLED, false);

            this.http
                .post<JWTResponse>(`${API_URL}/user/login`, loginDto, {
                    context,
                })
                .subscribe({
                    next: ({ access_token }: JWTResponse) => {
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem(TOKEN_KEY, access_token);
                        this.tokenSubject.next(access_token);
                        resolve();
                    },
                    error: (err: unknown) => {
                        reject(err);
                    },
                });
        });
    }

    setRegistered(): void {
        localStorage.setItem(REGISTERED_KEY, true.toString());
    }

    isRegistered(): boolean {
        return localStorage.getItem(REGISTERED_KEY) !== undefined;
    }

    logout(): void {
        // remove token from local storage and set current state to null
        localStorage.removeItem(TOKEN_KEY);

        this.tokenSubject.next(null);
        this.userSubject.next(null);
        this._state.next(State.loggedOut);

        void this.router.navigate(['/login']);
    }

    async register(signUpDto: UserSignUp): Promise<User> {
        const context = new HttpContext();
        context.set(AUTH_ENABLED, false);

        return await new Promise((resolve, reject) => {
            this.http
                .post<User>(`${API_URL}/user/create`, signUpDto, { context })
                .subscribe({
                    next: (user: User) => {
                        resolve(user);
                    },
                    error: (err: unknown) => {
                        reject(err);
                    },
                });
        });
    }

    async getAll(): Promise<User[]> {
        return await new Promise((resolve, reject) => {
            return this.http.get<User[]>(`${API_URL}/user/all`).subscribe({
                next: (users: User[]) => {
                    resolve(users);
                },
                error: (reason: unknown) => {
                    reject(reason);
                },
            });
        });
    }

    async getById(id: string): Promise<User> {
        return await new Promise((resolve, reject) => {
            return this.http.get<User>(`${API_URL}/user/find/${id}`).subscribe({
                next: (user: User) => {
                    resolve(user);
                },
                error: (reason: unknown) => {
                    reject(reason);
                },
            });
        });
    }

    async updateSelf(params: Partial<User>): Promise<User> {
        return await new Promise((resolve, reject) => {
            return this.http.patch<User>(`${API_URL}/user`, params).subscribe({
                next: (user: User) => {
                    this.userSubject.next(user);
                    resolve(user);
                },
                error: (reason: unknown) => {
                    reject(reason);
                },
            });
        });
    }

    async update(id: string, params: Partial<User>): Promise<User> {
        return await new Promise((resolve, reject) => {
            return this.http
                .patch<User>(`${API_URL}/user/${id}`, params)
                .subscribe({
                    next: (user: User) => {
                        // update stored user if the logged in user updated their own record
                        if (id === this.user?.id) {
                            // publish updated user to subscribers
                            this.userSubject.next(user);
                        }
                        resolve(user);
                    },
                    error: (reason: unknown) => {
                        reject(reason);
                    },
                });
        });
    }

    async deleteSelf(): Promise<User> {
        return await new Promise((resolve, reject) => {
            return this.http.delete<User>(`${API_URL}/user`).subscribe({
                next: (user: User) => {
                    this.logout();
                    resolve(user);
                },
                error: (reason: unknown) => {
                    reject(reason);
                },
            });
        });
    }

    async delete(id: string): Promise<User> {
        return await new Promise((resolve, reject) => {
            return this.http.delete<User>(`${API_URL}/user/${id}`).subscribe({
                next: (user: User) => {
                    if (id === this.user?.id) {
                        this.logout();
                    }
                    resolve(user);
                },
                error: (reason: unknown) => {
                    reject(reason);
                },
            });
        });
    }
}
