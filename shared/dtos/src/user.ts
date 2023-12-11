import { z } from 'zod';
import { COUNTRIES, LANGUAGE_LEVELS, LANGUAGES } from '@pathway-up/constants';

export const UserDtoSchema = z.object({
  name: z.string().max(20),
  bio: z.string().max(255),
  countryCode: z.nativeEnum(COUNTRIES),
  birthday: z.string().datetime().pipe(z.coerce.date()),
  interests: z.array(z.string().min(1).max(20)).max(5),
  nativeLanguages: z
    .array(z.nativeEnum(LANGUAGES))
    .max(5)
    .transform((vals) => [...new Set(vals)]),
  englishLevel: z.nativeEnum(LANGUAGE_LEVELS),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserPartialDtoSchema = UserDtoSchema.partial();

export type UserPartialDto = z.infer<typeof UserPartialDtoSchema>;
