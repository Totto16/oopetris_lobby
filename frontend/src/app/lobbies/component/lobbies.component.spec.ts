import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbiesComponent } from './lobbies.component';
import { LobbiesModule } from '../lobbies.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('DashboardComponent', () => {
    let component: LobbiesComponent;
    let fixture: ComponentFixture<LobbiesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LobbiesModule, RouterTestingModule, HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(LobbiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
