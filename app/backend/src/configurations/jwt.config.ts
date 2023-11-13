import { Algorithm } from 'jsonwebtoken'

import { registerAs } from './utils';

export const jwtConfig = registerAs('jwt', () => ({
  privateKey: process.env.PW_JWT_PRIVATE_KEY!,
  algorithm: process.env.PW_JWT_ALGORITHM as Algorithm,
  signupRequestExpiresIn: +process.env.PW_JWT_SIGNUP_REQUEST_EXPIRES_IN!,
  passwordChangeRequestExpiresIn:
    +process.env.PW_JWT_PASSWORD_CHANGE_REQUEST_EXPIRES_IN!,
}));

