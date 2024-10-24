import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountComponent } from './component/account.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxLoadingButtonsModule } from 'ngx-loading-buttons';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDividerModule,
        MatButtonModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        NgxLoadingButtonsModule,
    ],
    declarations: [AccountComponent, LoginComponent, RegisterComponent],
    exports: [AccountComponent],
    providers: [],
})
export class AccountModule {}
