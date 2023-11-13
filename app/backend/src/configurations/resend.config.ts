import { registerAs } from './utils';

export const resendConfig = registerAs('resend', () => ({
  signup: {
    cookie: {
      name: process.env.PW_RESEND_SIGNUP_COOKIE_NAME!,
      maxAge: +process.env.PW_RESEND_SIGNUP_COOKIE_MAX_AGE!,
    },
    interval: +process.env.PW_RESEND_SIGNUP_INTERVAL!,
    maxAttempts: +process.env.PW_RESEND_SIGNUP_MAX_ATTEMPTS!,
  },

  changePassword: {
    interval: +process.env.PW_RESEND_CHANGE_PASSWORD_INTERVAL!,
  }
}));


