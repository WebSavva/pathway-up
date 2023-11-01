import { jwtConfig } from './jwt.config';
import { dbConfig } from './db.config';
import { cryptoConfig } from './crypto.config';
import { modeConfig } from './mode.config';
import { mailConfig } from './mail.config';
import { cookiesConfig } from './cookies.config';
import { resendConfig } from './resend.config';

export const envLoadersMap = {
  jwtConfig,
  dbConfig,
  cryptoConfig,
  modeConfig,
  mailConfig,
  cookiesConfig,
  resendConfig,
};

export type EnvLoadersMap = typeof envLoadersMap;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type Env = UnionToIntersection<
  {
    [key in keyof EnvLoadersMap]: Record<
      EnvLoadersMap[key]['KEY'],
      ReturnType<EnvLoadersMap[key]>
    >;
  }[keyof EnvLoadersMap]
>;

export const envLoaders = Object.values(envLoadersMap);
