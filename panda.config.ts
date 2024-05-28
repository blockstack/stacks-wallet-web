import { defineConfig } from '@pandacss/dev';

import { globalCss } from './theme/global/global';

export default defineConfig({
  preflight: true,

  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  exclude: [],

  prefix: 'leather',

  presets: ['@leather-wallet/panda-preset'],

  studio: { logo: '💼' },

  jsxFramework: 'react',

  strictTokens: false,

  outdir: 'leather-styles',
  outExtension: 'js',
  minify: true,
  globalCss,
});
