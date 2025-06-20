import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserV2Service } from '../../../services/user.service';
import {
    CustomFormControl,
    FormClassLike,
    FormPropertyMap,
    ValidatorDescription,
    getAllValidators,
    getValidatorsFor,
} from '../../../helpers/validators';
import { ShakeOptions, Shakeable } from '@helpers/general';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    errorFromErrorObject,
    openSnackBar,
} from '../../lobbies/dialogs/error/error.component';

type LoginDict = {
    username: string;
    password: string;
};

type LoginControl = CustomFormControl<LoginDict>;

@Component({
    selector: 'lobbies-app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent
    extends Shakeable
    implements OnInit, FormClassLike<LoginDict>
{
    form!: FormGroup<LoginControl>;
    loading = false;
    hide = true;

    validators: FormPropertyMap<keyof LoginDict, ValidatorDescription>;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly userService: UserV2Service,
        private readonly snackBar: MatSnackBar,
    ) {
        super();
        this.validators = getAllValidators<keyof LoginDict>([
            'username',
            'password',
        ]);
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group<LoginControl>({
            username: new FormControl(
                '',
                getValidatorsFor(this.validators, 'username'),
            ),
            password: new FormControl(
                '',
                getValidatorsFor(this.validators, 'password'),
            ),
        });
    }

    // convenience getter for easy access to form fields
    get formControl(): LoginControl {
        return this.form.controls;
    }

    get shakeOptions(): ShakeOptions {
        return {
            elementID: 'login-shake-container',
        };
    }

    async onSubmit(): Promise<void> {
        // stop here if form is invalid
        if (this.form.invalid) {
            return this.formError();
        }
        this.cancelFormError();

        this.loading = true;

        try {
            // these values where all checked by validators!
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.userService.login({
                username: this.formControl.username.value!,
                password: this.formControl.password.value!,
            });

            this.loading = false;
            // get return url from query parameters or default to home page
            const returnUrl =
                (this.route.snapshot.queryParams['returnUrl'] as
                    | string
                    | undefined) ?? '/lobbies';
            await this.router.navigateByUrl(returnUrl);
        } catch (err) {
            this.loading = false;
            this.formError();
            const error = errorFromErrorObject(err);

            openSnackBar(this.snackBar, { error });
            return;
        }
    }
}
