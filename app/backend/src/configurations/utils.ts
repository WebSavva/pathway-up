import { registerAs as _registerAs } from '@nestjs/config';

export const registerAs = <
  K extends string,
  F extends () => Record<string, any>,
>(
  token: K,
  factory: F,
) => {
  const namespacedConfig = _registerAs(token, factory);

  return namespacedConfig as typeof namespacedConfig & { KEY: K };
};
