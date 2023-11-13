import { registerAs } from './utils';

export const cryptoConfig  = registerAs('crypto' ,() => ({
  passwordHashSaltRounds: +process.env.PW_PASSWORD_HASH_SALT_ROUNDS!
}))
