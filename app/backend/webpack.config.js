const escapeRegExp = require('lodash/escapeRegExp');
const swcDefaultConfig =
  require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
    .swcOptions;
const nodeExternals = require('webpack-node-externals');

const nestCliConfig = require('./nest-cli.json');

const { packagesToTranspile } = nestCliConfig;

module.exports = (config) => {
  const normalizedPackagesToTranspile = packagesToTranspile.map(
    (packageName) => {
      return new RegExp(escapeRegExp(packageName));
    },
  );

  // replacing ts-loader with more performant swc-loader
  // and adding support for transpilation of specific packages
  const tsRuleIndex = config.module.rules.findIndex(({ test: ruleRegEx }) =>
    ruleRegEx.test('test.ts'),
  );

  const swcLoaderRule = {
    test: /\.(ts|m?js)$/,
    use: {
      loader: 'swc-loader',
      options: swcDefaultConfig,
    },
    exclude: (rawFile) => {
      const file = rawFile.split(/node_modules(.*)/)[1];

      // not exclude files outside node_modules
      if (!file) {
        return false;
      }

      return !normalizedPackagesToTranspile.some((package) =>
        package.test(file),
      );
    },
  };

  config.module.rules.splice(tsRuleIndex, 1, swcLoaderRule);

  // adding support of transpilation of specific packages
  // in externals option too
  config.externals = [
    nodeExternals({
      allowlist: normalizedPackagesToTranspile,
    }),
  ];

  return config;
};
