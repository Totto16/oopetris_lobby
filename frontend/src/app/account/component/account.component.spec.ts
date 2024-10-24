import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountComponent } from './account.component';
import { LobbiesModule } from '../../lobbies/lobbies.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AccountModule } from '../account.module';
describe('AccountComponent', () => {
    let component: AccountComponent;
    let fixture: ComponentFixture<AccountComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NgIf,
                AccountModule,
                NoopAnimationsModule,
                LobbiesModule,
                RouterTestingModule,
                HttpClientModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
