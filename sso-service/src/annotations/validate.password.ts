import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    const minLength = /.{8,}/;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const digit = /\d/;
    const specialChar = /[@$!%*?&]/;
    const noWhitespace = /^\S*$/;

    return (
      minLength.test(password) &&
      upperCase.test(password) &&
      lowerCase.test(password) &&
      digit.test(password) &&
      specialChar.test(password) &&
      noWhitespace.test(password)
    );
  }

  defaultMessage(): string {
    return (
      'Password must be at least 8 characters long, contain at least one uppercase letter,' +
      ' one lowercase letter, one digit, one special character, and must not contain any whitespace'
    );
  }
}

export function ValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordValidator,
    });
  };
}
