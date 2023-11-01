import { registerAs } from './utils';

export const dbConfig = registerAs('db', () => ({
  host: process.env.PW_DB_HOST || '127.0.0.1',
  port: +process.env.PW_DB_PORT,
  user: process.env.PW_DB_USER,
  password: process.env.PW_DB_PASSWORD,
  database: process.env.PW_DB_NAME,
}));
