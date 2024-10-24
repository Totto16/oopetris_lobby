import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './component/app.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { AccountModule } from './account/account.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../helpers/jwt.interceptor';

@NgModule({
    imports: [
        BrowserModule,
        MatGridListModule,
        NgFor,
        NgIf,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        NgIf,
        AppRoutingModule,
        AccountModule,
        LobbiesModule,
        MatTooltipModule,
        MatMenuModule,
        MatSnackBarModule,
    ],
    declarations: [AppComponent, ToolbarComponent],
    providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
