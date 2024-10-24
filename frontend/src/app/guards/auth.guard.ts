import { Injectable } from '@angular/core';
import {
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { UserV2Service, State } from '../../services/user.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private readonly router: Router,
        private readonly userService: UserV2Service,
    ) {}

    canActivate(
        _route: ActivatedRouteSnapshot,
        routerState: RouterStateSnapshot,
    ): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            this.userService.state.subscribe({
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                next: async (): Promise<void> => {
                    const state = this.userService.stateValue;
                    if (state === State.uninitialized) {
                        return;
                    } else if (state === State.loggedIn) {
                        // authorized so return true
                        observer.next(true);
                        observer.complete();
                        return;
                    } else if (state === State.unauthenticated) {
                        await this.router.navigate(['/register']);
                        observer.next(false);
                        observer.complete();
                        return;
                    } else if (state === State.loggedOut) {
                        // not logged in so redirect to login page with the return url
                        await this.router.navigate(['/login'], {
                            queryParams: { returnUrl: routerState.url },
                        });
                        observer.next(false);
                        observer.complete();
                        return;
                    }

                    throw new Error(
                        `Auth guard: Internal error: Couldn't fetch state: ${state as string}`,
                    );
                },
            });
        });
    }
}
