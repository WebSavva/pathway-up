import { registerAs } from './utils';

export const s3Config = registerAs('s3', () => ({
  url: process.env.PW_S3_URL,
  bucket: process.env.PW_S3_BUCKET,
  accessKey: process.env.PW_S3_ACCESS_KEY,
  secretKey: process.env.PW_S3_SECRET_KEY,
}));
