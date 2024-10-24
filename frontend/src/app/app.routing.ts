import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { AccountComponent } from './account/component/account.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { LobbiesComponent } from './lobbies/component/lobbies.component';

const routes: Routes = [
    {
        path: '',
        component: AccountComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
        ],
    },
    { path: 'lobbies', component: LobbiesComponent, canActivate: [AuthGuard] },
    // otherwise redirect to standard path
    { path: '**', redirectTo: 'lobbies' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
