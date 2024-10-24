import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from '../app.module';
import { User } from '@helpers/entities';
import { UserRole } from '@oopetris_lobby/shared';
import { v4 as uuidv4 } from 'uuid';

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppModule, RouterTestingModule, HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        const user: User = {
            id: uuidv4(),
            password: '',
            role: UserRole.Admin,
            username: 'admin',
        };
        component.user = user;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
