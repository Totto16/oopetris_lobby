import {
    AbstractControl,
    FormControl,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { Validators } from '@angular/forms';

export interface SameAsValidatorOptions<T> {
    name: T;
    toMatch: T;
}

export function sameAs<T extends StringRecord>({
    name,
    toMatch,
}: SameAsValidatorOptions<Extract<keyof T, string>>) {
    return (formGroup: AbstractControl<T>): ValidationErrors | null => {
        const value = formGroup.get(name);

        if (value?.value === undefined) {
            throw new Error(`no such key ${name} in properties of formData!`);
        }

        const otherValue = formGroup.get(toMatch);
        if (otherValue?.value === undefined) {
            throw new Error(
                `no such key ${toMatch} in properties of formData!`,
            );
        }

        if (value.value === otherValue.value) {
            const needsUpdate = otherValue.errors?.['sameas'] !== undefined;
            delete otherValue.errors?.['sameas'];
            // to fire an update event and clear the invalid state
            if (needsUpdate) {
                otherValue.updateValueAndValidity();
            }

            return null;
        }

        const error = {
            sameas: { value: value.value, otherValue: otherValue.value },
        };
        otherValue.setErrors({ ...error, ...otherValue.errors });
        return error;
    };
}

export function validateIfDefined<T extends string>(
    name: T,
    validator: ValidatorFn,
) {
    return (formGroup: AbstractControl<T>): ValidationErrors | null => {
        const value = formGroup.get(name);

        if (value?.value === undefined || value.value === null) {
            return null;
        }

        return validator(formGroup);
    };
}

export function isEnum<T extends string, S extends Record<string, string>>(
    name: T,
    type: S,
) {
    return (formGroup: AbstractControl<T>): ValidationErrors | null => {
        const value = formGroup.get(name);

        if (value?.value === undefined) {
            throw new Error(`no such key ${name} in properties of formData!`);
        }

        const allPossibleEnumValues = Object.values(type);

        if (allPossibleEnumValues.includes(value.value)) {
            return null;
        }

        const error = {
            isenum: {
                value: value.value,
                possibleValues: allPossibleEnumValues,
            },
        };
        return error;
    };
}

export function validateIfDefinedArray<T extends string>(
    key: T,
    validators: ValidatorDescription[],
): ValidatorDescription[] {
    const result: ValidatorDescription[] = [];

    for (const validator of validators) {
        const obj: ValidatorDescription = {
            validator: validateIfDefined<T>(key, validator.validator),
            error: `${validator.error} or not defined`,
            hasError(this: FormClassLike<{ [key in T]: string }>): boolean {
                const isUndefined =
                    this.formControl[key].value === undefined ||
                    this.formControl[key].value === null;

                if (isUndefined) {
                    return false;
                }
                return hasError.call<
                    FormClassLike<{ [key in T]: string }>,
                    [typeof key, string],
                    boolean
                >(this, key, 'min');
            },
        };
        result.push(obj);
    }

    return result;
}

export type StringRecord<V = unknown> = {
    [key: string]: V;
};

export type FormPropertyMap<T extends string, V = string> = {
    [key in T]: V[];
};

export interface ValidatorDescription {
    hasError(): boolean;
    error: string;
    validator: ValidatorFn;
}

export function getValidatorsFor<T extends StringRecord>(
    propertyMap: FormPropertyMap<
        Extract<keyof T, string>,
        ValidatorDescription
    >,
    key: Extract<keyof T, string>,
): ValidatorFn[] {
    return propertyMap[key].map(({ validator }) => validator);
}

export type CustomFormControl<T extends StringRecord> = {
    [key in keyof T]: FormControl<T[key] | null>;
};

export interface FormClassLike<
    A extends StringRecord,
    T extends CustomFormControl<A> = CustomFormControl<A>,
> {
    get formControl(): T;
}

function hasError<T extends StringRecord>(
    this: FormClassLike<T>,
    type: keyof T,
    errorCode: string,
): boolean {
    return (
        this.formControl[type].errors !== null &&
        this.formControl[type].getError(errorCode) !== undefined
    );
}

const allValidators = {
    username: [
        {
            validator: Validators.required.bind(this),
            error: 'The username is required',
            hasError(this: FormClassLike<{ username: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ username: string }>,
                    ['username', string],
                    boolean
                >(this, 'username', 'required');
            },
        },

        {
            validator: Validators.minLength(4),
            error: 'The username must be longer than 3 characters',
            hasError(this: FormClassLike<{ username: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ username: string }>,
                    ['username', string],
                    boolean
                >(this, 'username', 'minlength');
            },
        },

        {
            validator: Validators.maxLength(20),
            error: 'The username must be shorter than 21 characters',
            hasError(this: FormClassLike<{ username: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ username: string }>,
                    ['username', string],
                    boolean
                >(this, 'username', 'maxlength');
            },
        },
    ],
    password: [
        {
            validator: Validators.required.bind(this),
            error: 'The password is required',
            hasError(this: FormClassLike<{ password: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ password: string }>,
                    ['password', string],
                    boolean
                >(this, 'password', 'required');
            },
        },
        {
            validator: Validators.minLength(8),
            error: 'The password must be longer than 7 characters',
            hasError(this: FormClassLike<{ password: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ password: string }>,
                    ['password', string],
                    boolean
                >(this, 'password', 'minlength');
            },
        },

        {
            validator: Validators.maxLength(30),
            error: 'The password must be shorter than 31 characters',
            hasError(this: FormClassLike<{ password: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ password: string }>,
                    ['password', string],
                    boolean
                >(this, 'password', 'maxlength');
            },
        },

        {
            validator: Validators.pattern(
                /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            ),
            error: "The password can't be too weak",
            hasError(this: FormClassLike<{ password: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ password: string }>,
                    ['password', string],
                    boolean
                >(this, 'password', 'pattern');
            },
        },
    ],
    passwordConfirm: [
        {
            // this is a dummy
            validator: (): null | ValidationErrors => {
                return null;
            },
            error: 'The password to confirm has to be the same as the password',
            hasError(
                this: FormClassLike<{ passwordConfirm: string }>,
            ): boolean {
                return hasError.call<
                    FormClassLike<{ passwordConfirm: string }>,
                    ['passwordConfirm', string],
                    boolean
                >(this, 'passwordConfirm', 'sameas');
            },
        },
    ],
    title: [
        {
            validator: Validators.required.bind(this),
            error: 'The title is required',
            hasError(this: FormClassLike<{ title: string }>): boolean {
                return hasError.call<
                    FormClassLike<{ title: string }>,
                    ['title', string],
                    boolean
                >(this, 'title', 'required');
            },
        },
    ],
    content: [],
    priority: [
        ...validateIfDefinedArray('priority', [
            {
                validator: Validators.min(0),
                error: 'The priority must be larger than or equal to 0',
                hasError(this: FormClassLike<{ priority: string }>): boolean {
                    return hasError.call<
                        FormClassLike<{ priority: string }>,
                        ['priority', string],
                        boolean
                    >(this, 'priority', 'min');
                },
            },
        ]),
    ],
};

export function getAllValidators<T extends keyof typeof allValidators>(
    keys: T[],
): FormPropertyMap<T, ValidatorDescription> {
    const result: Partial<FormPropertyMap<T, ValidatorDescription>> = {};
    for (const [key, value] of Object.entries(allValidators)) {
        if (keys.includes(key as T)) {
            result[key as T] = value;
        }
    }

    return result as FormPropertyMap<T, ValidatorDescription>;
}
