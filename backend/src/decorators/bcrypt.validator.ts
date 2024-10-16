import {
    registerDecorator,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import bcrypt from 'bcrypt';
//from: https://stackoverflow.com/questions/60451337/password-confirmation-in-typescript-with-class-validator
export function IsNotBcryptEncrypted() {
    return (object: any, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            constraints: [],
            validator: IsNotBcryptEncryptedConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'IsNotBcryptEncrypted' })
export class IsNotBcryptEncryptedConstraint
    implements ValidatorConstraintInterface
{
    validate(value: string): boolean {
        try {
            bcrypt.getRounds(value);
            return false;
        } catch (error) {
            return true;
        }
    }
    defaultMessage(args?: ValidationArguments): string {
        if (args === undefined) {
            return 'The supplied value is bcrypt encrypted!';
        }

        const object = args.object as Record<string, string>;

        return `The value '${object[args.property]}' is bcrypt encrypted!`;
    }
}
