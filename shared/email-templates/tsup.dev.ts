import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['scripts/dev.ts'],

  outDir: 'dist',

  format: 'cjs',

  watch: 'src',

  external: [/@pathway-up\/static/, 'react', /@?react-email/],

  onSuccess: 'node dist/dev.js',
});
