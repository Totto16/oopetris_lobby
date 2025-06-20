import { Component, Input } from '@angular/core';
import type { User } from '@helpers/entities';
import { UserV2Service } from '../../../services/user.service';

@Component({
    selector: 'lobbies-component',
    templateUrl: './lobbies.component.html',
    styleUrls: ['./lobbies.component.scss'],
    standalone: false
})
export class LobbiesComponent {
    @Input({ required: true }) title!: string;

    user: User | null;

    constructor(private readonly userService: UserV2Service) {
        this.user = null;
        this.userService.userObserver.subscribe((x) => (this.user = x));
    }
}
