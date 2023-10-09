import { PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ZodObject } from 'zod';
import { fromZodError } from 'zod-validation-error';

export class ValidationPipe<S extends ZodObject<any> = ZodObject<any>>
  implements PipeTransform
{
  constructor(private schema: S) {}

  async transform(value: any) {
    const validationResult = await this.schema.safeParseAsync(value);

    if (validationResult.success === true) {
      return validationResult.data;
    } else {
      const formattedValidationError = fromZodError(validationResult.error);

      const { message: validatioErrorMessage } = formattedValidationError;

      throw new BadRequestException(validatioErrorMessage, {
        cause: formattedValidationError,
        description: validatioErrorMessage,
      });
    }
  }
}
