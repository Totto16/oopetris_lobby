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
export function Match(
    property: string,
    validationOptions?: MatchValidationOptions,
) {
    return (object: any, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property, validationOptions?.secret ?? false],
            validator: MatchConstraint,
        });
    };
}

interface MatchValidationArguments extends ValidationArguments {
    constraints: [relatedPropertyName: string, secret: boolean];
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: MatchValidationArguments): boolean {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
        ];
        return value === relatedValue;
    }
    defaultMessage(args?: MatchValidationArguments): string {
        if (args === undefined) {
            return "Two arguments, that should match, didn't match";
        }

        const [arg, secret] = args.constraints;
        const toMatchWith = args.property;

        const object = args.object as Record<string, string>;

        let message: string;
        if (secret) {
            message = `'${object[arg]
                .split('')
                .map(() => '*')
                .join('')}' !== '${object[toMatchWith]
                .split('')
                .map(() => '*')
                .join('')}'`;
        } else {
            message = `'${object[arg]}' !== '${object[toMatchWith]}'`;
        }
        return `The value of '${arg}' should match the value of ${toMatchWith}: ${message}`;
    }
}
