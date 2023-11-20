import { registerAs } from './utils';

export const urlConfig = registerAs('url', () => ({
  clientBaseUrl: process.env.PW_URL_CLIENT_BASE_URL!,
}));


