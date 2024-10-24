import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LobbiesComponent } from './component/lobbies.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatGridListModule,
        MatToolbarModule,
        MatButtonModule,
        CdkDropList,
        CdkDrag,
        MatCardModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatSnackBarModule,
    ],
    declarations: [LobbiesComponent],
    exports: [LobbiesComponent],
})
export class LobbiesModule {}
