import { UserV2Service } from '../../services/user.service';
import { Component, Input } from '@angular/core';
import { User } from '@helpers/entities';

@Component({
    selector: 'oopetris-lobbies-root-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
    @Input({ required: true }) title!: string;

    user: User | null;

    constructor(private readonly userService: UserV2Service) {
        this.user = null;
        this.userService.userObserver.subscribe({
            next: (x) => (this.user = x),
        });
    }
}
