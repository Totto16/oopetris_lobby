import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export interface MatchOptions {
    secret?: boolean;
    allowUndefined?: boolean;
}

export interface MatchValidationOptions
    extends ValidationOptions,
        MatchOptions {}

//from: https://stackoverflow.com/questions/60451337/password-confirmation-in-typescript-with-class-validator
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function Match<T, Key extends keyof T>(
    property: string,
    validationOptions?: MatchValidationOptions,
) {
    return (object: T, propertyName: string): void => {
        registerDecorator({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            target: (object as any).constructor,
            propertyName,
            options: validationOptions,
            constraints: [
                property,
                {
                    secret: validationOptions?.secret ?? false,
                    allowUndefined: validationOptions?.allowUndefined ?? false,
                },
            ],
            validator: MatchConstraint<T, Key>,
        });
    };
}

type ValidationArgumentsTyped<T> = ValidationArguments & {
    object: T;
};

interface MatchValidationArguments<T, Key extends keyof T>
    extends ValidationArgumentsTyped<T> {
    constraints: [relatedPropertyName: Key, options: MatchOptions];
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint<T, Key extends keyof T>
    implements ValidatorConstraintInterface
{
    validate(value: T[Key], args: MatchValidationArguments<T, Key>): boolean {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as T)[relatedPropertyName];
        return value === relatedValue;
    }
    defaultMessage(args?: MatchValidationArguments<T, Key>): string {
        if (args === undefined) {
            return "Two arguments, that should match, didn't match";
        }

        const [arg, { secret, allowUndefined }] = args.constraints;
        const toMatchWith = args.property;

        const object = args.object as Record<string | Key, keyof T | undefined>;
        if (!allowUndefined) {
            if (
                object[arg] === undefined ||
                object[toMatchWith] === undefined
            ) {
                return 'Two arguments, that should be defined, are missing';
            }
        }

        function argToString(input: keyof T | undefined | null): string {
            if (input === undefined || input === null) {
                return 'undefined';
            }

            if (secret) {
                return `'${'*'.repeat(input.toString().length)}'`;
            }

            return `'${input.toString()}'`;
        }

        return `The value of '${arg.toString()}' should match the value of ${toMatchWith}: ${argToString(object[arg])} !== ${argToString(object[toMatchWith])}`;
    }
}
