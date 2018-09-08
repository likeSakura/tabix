import path from 'path';
import webpackMerge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import tsImportPlugin from 'ts-import-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import paths from '@vzh/configs/paths';
import appEnv from '@vzh/configs/appEnv';
import clientConfigTs, { baseDefaultRules } from '@vzh/configs/webpack/client.config.ts';
import { defaultRules } from '@vzh/configs/webpack/client.config';
import loaders from '@vzh/configs/webpack/loaders';

const config = webpackMerge(
  clientConfigTs({
    rhl: false,

    entry: {
      app: ['./index'],
    },

    rules: {
      tsRule: {
        ...baseDefaultRules.tsRule,
        use: loaders.ts({
          tsconfig: path.join(paths.client.root, 'tsconfig.json'),
          forkedChecks: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPlugin({
                libraryDirectory: 'es',
                libraryName: 'antd',
                style: 'css',
              }),
            ],
          }),
          compilerOptions: {
            module: 'esnext',
            resolveJsonModule: false,
          },
        }),
      },

      cssNodeModulesRule: {
        ...defaultRules.cssNodeModulesRule,
        exclude: [path.join(paths.nodeModules.root, 'monaco-editor')],
      },

      monacoCssRule: {
        ...defaultRules.cssNodeModulesRule,
        include: [path.join(paths.nodeModules.root, 'monaco-editor')],
        use: [
          appEnv.ifDevMode('style-loader', MiniCssExtractPlugin.loader),
          ...loaders.css({ modules: false, postcss: false }),
        ],
      },
    },
  }),
  {
    module: {
      rules: [{ test: /\.pug$/, loader: 'pug-loader' }],
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: path.join(paths.client.assets, 'index.pug'),
        filename: 'index.html',
      }),
      new MonacoWebpackPlugin(),
    ],
  }
);

// console.log(JSON.stringify(config));

export default config;
