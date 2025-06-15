import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { AccountComponent } from './account/component/account.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { LobbiesComponent } from './lobbies/component/lobbies.component';
import { OverviewComponent } from './overview/component/overview.component';

const routes: Routes = [
    {
        path: 'account',
        component: AccountComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
        ],
    },
    { path: 'overview', component: OverviewComponent },
    { path: 'lobbies', component: LobbiesComponent, canActivate: [AuthGuard] },
    // otherwise redirect to standard path
    { path: '**', redirectTo: 'overview' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
