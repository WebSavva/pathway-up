export const mode = () => ({
  mode: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
});
