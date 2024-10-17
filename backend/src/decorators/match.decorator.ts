import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export interface MatchValidationOptions extends ValidationOptions {
    secret?: boolean;
}

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
            constraints: [property, validationOptions?.secret ?? false],
            validator: MatchConstraint<T, Key>,
        });
    };
}

type ValidationArgumentsTyped<T> = ValidationArguments & {
    object: T;
};

interface MatchValidationArguments<T, Key extends keyof T>
    extends ValidationArgumentsTyped<T> {
    constraints: [relatedPropertyName: Key, secret: boolean];
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

        const [arg, secret] = args.constraints;
        const toMatchWith = args.property;

        const object = args.object as Record<string, keyof T>;

        let message: string;
        if (secret) {
            message = `'${object[arg]
                .toString()
                .split('')
                .map(() => '*')
                .join('')}' !== '${object[toMatchWith]
                .toString()
                .split('')
                .map(() => '*')
                .join('')}'`;
        } else {
            message = `'${object[arg].toString()}' !== '${object[toMatchWith].toString()}'`;
        }
        return `The value of '${arg.toString()}' should match the value of ${toMatchWith}: ${message}`;
    }
}
