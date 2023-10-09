import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_VALIDATION_ERROR_MESSAGE =
  'Password must be longer than 10 symbols and contain at least one capital and one lower-case letter, one digit and one special symbol !';

export const passwordValidator = (val: unknown) => {
  return (
    typeof val === 'string' &&
    val.length > PASSWORD_MIN_LENGTH &&
    [/[A-Z]/, /[a-z]/, /\d/, /[@?!@#$^&]/].every((regExp) => regExp.test(val))
  );
};

export const password = (message: string = PASSWORD_VALIDATION_ERROR_MESSAGE) => z.custom<string>(
  passwordValidator,
  message,
);
