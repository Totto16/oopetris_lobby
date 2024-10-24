import { Component, Input } from '@angular/core';
import { User } from '@helpers/entities';
import { Router } from '@angular/router';
import { UserV2Service } from '../../services/user.service';

@Component({
    selector: 'lobbies-app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
    @Input({ required: true }) title!: string;

    @Input({ required: true }) user!: User | null;
    constructor(
        private readonly router: Router,
        private readonly userService: UserV2Service,
    ) {}

    redirect(location: string): void {
        void this.router.navigate([location]);
    }

    logout(): void {
        this.userService.logout();
    }

    editDialog(): void {
        //
    }
}
