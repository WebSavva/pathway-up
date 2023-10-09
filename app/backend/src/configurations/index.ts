import { jwt } from './jwt.config';
import { db } from './db.config';
import { crypto } from './crypto.config';
import { mode } from './mode.config';

const envLoaders = {
  jwt,
  db,
  crypto,
  mode,
};

export type EnvLoaders = typeof envLoaders;

export type Env = {
  [key in keyof EnvLoaders]: ReturnType<EnvLoaders[key]>;
};

export const loadAllConfigurations = () => {
  return Object.fromEntries(
    Object.entries(envLoaders).map(([key, factory]) => [key, factory()]),
  );
};
