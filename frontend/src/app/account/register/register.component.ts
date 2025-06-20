import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    CustomFormControl,
    FormClassLike,
    FormPropertyMap,
    ValidatorDescription,
    getAllValidators,
    getValidatorsFor,
    sameAs,
} from '../../../helpers/validators';
import { UserV2Service } from '../../../services/user.service';
import { ShakeOptions, Shakeable } from '@helpers/general';
import {
    errorFromErrorObject,
    openSnackBar,
} from '../../lobbies/dialogs/error/error.component';
import { MatSnackBar } from '@angular/material/snack-bar';

type SignUpDict = {
    username: string;
    password: string;
    passwordConfirm: string;
};

type SignUpControl = CustomFormControl<SignUpDict>;

@Component({
    selector: 'lobbies-app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent
    extends Shakeable
    implements OnInit, FormClassLike<SignUpDict>
{
    form!: FormGroup<SignUpControl>;
    loading = false;
    hide = true;

    validators: FormPropertyMap<keyof SignUpDict, ValidatorDescription>;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly userService: UserV2Service,
        private readonly snackBar: MatSnackBar,
    ) {
        super();
        this.validators = getAllValidators<keyof SignUpDict>([
            'username',
            'password',
            'passwordConfirm',
        ]);
    }

    /*
     */
    ngOnInit(): void {
        this.form = this.formBuilder.group<SignUpControl>(
            {
                username: new FormControl<string>(
                    '',
                    getValidatorsFor(this.validators, 'username'),
                ),
                password: new FormControl<string>(
                    '',
                    getValidatorsFor(this.validators, 'password'),
                ),
                passwordConfirm: new FormControl<string>(''),
            },
            {
                validators: sameAs<SignUpControl>({
                    name: 'password',
                    toMatch: 'passwordConfirm',
                }),
            },
        );

        const username = this.route.snapshot.queryParams['username'] as
            | string
            | undefined;
        if (username !== undefined) {
            this.formControl.username.setValue(username);
            this.form.updateValueAndValidity();
        }
    }

    // convenience getter for easy access to form fields
    get formControl(): SignUpControl {
        return this.form.controls;
    }

    get shakeOptions(): ShakeOptions {
        return {
            elementID: 'register-shake-container',
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
            await this.userService.register({
                username: this.formControl.username.value!,
                password: this.formControl.password.value!,
                passwordConfirm: this.formControl.passwordConfirm.value!,
            });

            this.loading = false;
            await this.router.navigate(['/login'], {
                queryParams: { username: this.formControl.username.value },
            });
        } catch (err) {
            this.loading = false;
            this.formError();

            const error = errorFromErrorObject(err);

            openSnackBar(this.snackBar, { error });
        }
    }
}
