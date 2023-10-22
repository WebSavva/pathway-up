import { defineConfig } from 'tsup';
import jiti from 'jiti';

import { createCommonJS } from 'mlly';

const { __dirname } = createCommonJS(import.meta.url);

export default defineConfig({
  entry: ['src/index.ts'],

  outDir: 'dist',

  noExternal: [/@?react-email/],

  async onSuccess() {
    const { startDevServer } = jiti(__dirname, {
      requireCache: false,
    })('./scripts/dev.ts') as typeof import('./scripts/dev');

    const devServer = startDevServer();

    return () => {
      devServer.close();
    };
  },
});
