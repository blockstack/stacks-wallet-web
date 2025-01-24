import { execSync } from 'node:child_process';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from 'node:module';
import path from 'node:path';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as url from 'url';

import packageJson from '../package.json' assert { type: 'json' };
import generateManifest from '../scripts/generate-manifest.js';


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SRC_ROOT_PATH = path.join(__dirname, '../', 'src');
const DIST_ROOT_PATH = path.join(__dirname, '../', 'dist');

const WALLET_ENVIRONMENT = process.env.WALLET_ENVIRONMENT ?? 'development';
const ANALYZE_BUNDLE = process.env.ANALYZE === 'true';
const IS_PUBLISHING = !!process.env.IS_PUBLISHING;

const IS_DEV = WALLET_ENVIRONMENT === 'development';
const IS_PROD = !IS_DEV;
const MAIN_BRANCH = 'refs/heads/main';

function executeGitCommand(command) {
  return execSync(command)
    .toString('utf8')
    .replace(/[\n\r\s]+$/, '');
}

const BRANCH_NAME = executeGitCommand('git rev-parse --abbrev-ref HEAD');
const COMMIT_SHA = process.env.COMMIT_SHA ?? executeGitCommand('git rev-parse HEAD');

console.log({
  BRANCH_NAME,
  envSha: process.env.COMMIT_SHA,
  locallyExe: executeGitCommand('git rev-parse HEAD'),
});

const require = createRequire(import.meta.url);

// For non main branch builds, add a random number
const getVersionWithRandomSuffix = ref => {
  if (ref === MAIN_BRANCH || !ref || IS_PUBLISHING) return packageJson.version;
  return `${packageJson.version}.${Math.floor(Math.floor(Math.random() * 1000))}`;
};
const VERSION = getVersionWithRandomSuffix(BRANCH_NAME);

const HTML_OPTIONS = {
  inject: 'body',
  chunks: ['index', 'common'],
};

const HTML_PROD_OPTIONS = IS_DEV
  ? HTML_OPTIONS
  : {
      ...HTML_OPTIONS,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    };

const aliases = {
  // alias stacks.js packages to their esm (default prefers /dist/polyfill)
  '@stacks/auth': '@stacks/auth/dist/esm',
  '@stacks/common': '@stacks/common/dist/esm',
  '@stacks/encryption': '@stacks/encryption/dist/esm',
  '@stacks/network': '@stacks/network/dist/esm',
  '@stacks/profile': '@stacks/profile/dist/esm',
  '@stacks/transactions': '@stacks/transactions/dist/esm',
  '@stacks/wallet-sdk': '@stacks/wallet-sdk/dist/esm',
  'leather-styles': path.resolve('leather-styles'),
  'react': path.resolve('./node_modules/react'),
  'react-dom': path.resolve('./node_modules/react-dom')
};

export const config = {
  entry: {
    background: path.join(SRC_ROOT_PATH, 'background', 'background.ts'),
    inpage: path.join(SRC_ROOT_PATH, 'inpage', 'inpage.ts'),
    'content-script': path.join(SRC_ROOT_PATH, 'content-scripts', 'content-script.ts'),
    index: path.join(SRC_ROOT_PATH, 'app', 'index.tsx'),
    'decryption-worker': path.join(SRC_ROOT_PATH, 'shared/workers/decryption-worker.ts'),
    debug: path.join(SRC_ROOT_PATH, '../scripts/debug.js'),
  },
  output: {
    path: DIST_ROOT_PATH,
    chunkFilename: !IS_DEV ? '[name].[contenthash:8].chunk.js' : IS_DEV && '[name].chunk.js',
    filename: () => '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.d.ts', '.mdx'],
    plugins: [new TsconfigPathsPlugin()],
    alias: aliases,
    fallback: {
      global: false,
      node: false,
      buffer: require.resolve("buffer/"),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      assert: require.resolve('assert'),
      'lottie-web': path.resolve('node_modules/lottie-web/build/player/lottie_light.js'),
      fs: require.resolve('browserify-fs'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      process: require.resolve('process/browser'),
    },
  },
  externals: {
    'cross-fetch': 'fetch',
  },
  optimization: {
    minimize: false,
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      name: 'common',
    },
    runtimeChunk: false,
  },
  module: {
    noParse: /argon2\.wasm$/,
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env', '@pandacss/dev/postcss'],
              },
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // disable the behavior, reference: https://webpack.js.org/configuration/module/#resolvefullyspecified
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: { tsconfig: './tsconfig.json', target: 'es2020' },
      },
      {
        test: /\.(js)$/,
        include: [/node_modules\/@leather.io\/ui/],
        loader: 'esbuild-loader',
        options: { tsconfig: './tsconfig.json', loader: 'jsx',target: 'es2020' },
      },
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: '@mdx-js/loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false
                      },
                    },
                  },
                ]
              }
            }
          },
        ],
      },
      {
        test: /argon2\.wasm$/,
        // Tells WebPack that this module should be included as
        // base64-encoded binary file and not as code
        loader: 'base64-loader',
        // Disables WebPack's opinion where WebAssembly should be,
        // makes it think that it's not WebAssembly
        //
        // Error: WebAssembly module is included in initial chunk.
        type: 'javascript/auto',
      },
      {
        test: /cfddlcjs_wasm\.wasm/,
        type: 'asset/resource',
        generator: {
          filename: '[name].wasm',
        },
      },
    ].filter(Boolean),
  },
  watch: false,
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/wordlists\/(?!english)/,
      contextRegExp: /bip39\/src$/,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'index.html'),
      filename: 'index.html',
      ...HTML_PROD_OPTIONS,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'popup.html'),
      filename: 'popup.html',
      ...HTML_PROD_OPTIONS,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'action-popup.html'),
      filename: 'action-popup.html',
      ...HTML_PROD_OPTIONS,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, '../', 'public', 'html', 'debug.html'),
      filename: 'debug.html',
      title: 'Leather—Debugger',
      chunks: ['debug'],
    }),
    new GenerateJsonPlugin(
      'manifest.json',
      generateManifest(VERSION),
      undefined,
      2 // space tabs
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(SRC_ROOT_PATH, '../', 'public', 'assets'),
          to: path.join(DIST_ROOT_PATH, 'assets'),
        },
        { from: 'node_modules/argon2-browser/dist/argon2.wasm', to: '.' },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
        { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js.map' },
      ],
    }),

    new Dotenv({
      allowEmptyValues: true,
      systemvars: true,
    }),

    new webpack.DefinePlugin({
      VERSION: JSON.stringify(VERSION),
    }),

    new webpack.EnvironmentPlugin({
      BRANCH_NAME: BRANCH_NAME,
      COMMIT_SHA: COMMIT_SHA,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),

    new ProgressBarPlugin(),

    ...(ANALYZE_BUNDLE ? [new BundleAnalyzerPlugin()] : []),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};
