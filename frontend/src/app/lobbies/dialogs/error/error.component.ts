import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ErrorDescription {
    type: string;
    message: string;
}

export interface ErrorComponentData {
    error: ErrorDescription;
    duration: number;
}

const FPS = 30;

const intervalTime = 1000 / FPS;

@Component({
    selector: 'lobbies-app-error-snackbar',
    templateUrl: 'error.component.html',
    styleUrls: ['./error.component.scss'],
    imports: [MatIconModule, MatProgressBarModule, MatButtonModule, MatTooltipModule],
    standalone: true,
})
export class ErrorComponent implements OnDestroy {
    timeoutProgress = 100;
    intervalID: number;

    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: ErrorComponentData,
        private readonly snackRef: MatSnackBarRef<ErrorComponent>
    ) {
        const startTime = new Date().getTime();
        this.intervalID = window.setInterval(() => {
            const currentTime = new Date().getTime();
            const diff = currentTime - startTime;

            this.timeoutProgress = Math.max(0, 100 - (diff / this.data.duration) * 100);
        }, intervalTime);
    }
    ngOnDestroy(): void {
        clearInterval(this.intervalID);
    }

    close(): void {
        this.snackRef.dismiss();
    }
}

export interface SnackBarOptions {
    error: ErrorDescription;
    duration?: number;
}

export function getFromHTTPErrorCode(err: HttpErrorResponse): ErrorDescription {
    //not completely true all the time, but mostly accurate
    if (err.status >= 500) {
        return { type: 'Server error', message: 'The API is offline' };
    }

    if (err.status === 0) {
        return { type: 'Server error', message: 'The proxy is offline' };
    }

    if (err.status === 401) {
        return { type: 'Authentication error', message: 'You are not logged in' };
    }

    if (err.status === 400) {
        return { type: 'Data error', message: `The data was invalid: ${err.message}` };
    }

    //This is not general, but atm the only way this can occur
    if (err.status === 422) {
        return { type: 'Duplicate Error', message: 'user with this username already exists' };
    }

    console.error(err);
    return { type: 'Unknown API Error', message: err.message };
}

export function errorFromErrorObject(obj: unknown): ErrorDescription {
    if (!(obj instanceof Error) && !(obj instanceof HttpErrorResponse)) {
        throw new Error(`Not an error: ${JSON.stringify(obj)}`);
    }

    if (obj instanceof HttpErrorResponse) {
        return getFromHTTPErrorCode(obj);
    }

    return { type: 'Unknown error', message: obj.message };
}

export function openSnackBar(snackBar: MatSnackBar, options: SnackBarOptions): void {
    const duration = options.duration ?? 5000;
    // if one is already open, dismiss it!
    snackBar._openedSnackBarRef?.dismiss();
    snackBar.openFromComponent<ErrorComponent, ErrorComponentData>(ErrorComponent, {
        duration,
        data: { error: options.error, duration },
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar-class'],
    });
}
