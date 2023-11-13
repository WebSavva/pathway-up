import { registerAs } from './utils';

export const cookiesConfig = registerAs('cookies', () => ({
  domain: process.env.PW_COOKIES_DOMAIN!,
  secret: process.env.PW_COOKIES_SECRET!,
}));
