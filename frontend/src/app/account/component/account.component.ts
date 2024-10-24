import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { State, UserV2Service } from '../../../services/user.service';

@Component({
    selector: 'lobbies-app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
    constructor(
        private readonly router: Router,
        private readonly userService: UserV2Service,
    ) {
        this.userService.state.subscribe({
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            next: async () => {
                const state = this.userService.stateValue;
                if (state === State.uninitialized) {
                    return;
                } else if (state === State.loggedIn) {
                    await this.router.navigate(['/lobbies']);
                    return;
                } else if (
                    state === State.loggedOut ||
                    this.userService.isRegistered()
                ) {
                    await this.router.navigate(['/login']);
                    return;
                } else if (state === State.unauthenticated) {
                    await this.router.navigate(['/register']);
                    return;
                }

                throw new Error(
                    `Account.component: Internal error: Couldn't fetch state: ${state as string}`,
                );
            },
        });
    }

    shouldShowSpinner(): boolean {
        return this.userService.stateValue === State.uninitialized;
    }
}
