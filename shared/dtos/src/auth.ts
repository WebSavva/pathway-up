import { z } from 'zod';

import { password } from './validators';

export const AuthUserDtoSchema = z
  .object({
    email: z.string().email(),
    password: password(),
  })
  .required();

export type AuthUserDto = z.infer<typeof AuthUserDtoSchema>;

export const ConfirmationPayloadSchema = z
  .object({
    confirmationHash: z.string(),
  })
  .required();

export type ConfirmationPayload = z.infer<typeof ConfirmationPayloadSchema>;

export const AuthPayloadSchema = z
  .object({
    userId: z.number(),
  })
  .required();

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
