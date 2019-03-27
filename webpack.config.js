const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'plurkcss-editor.js',
    path: __dirname + '/dist',
    publicPath: 'https://moka-rin.moe/misc/plurkcss/',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ]
  },

  node: {
    fs: 'empty',
  },

  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: false,
          ecma: 6,
          mangle: true,
          output: {
            quote_style: 2,
            max_line_len: 1024,
          },
        },
        sourceMap: true,
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: 'advanced',
        },
      }),
    ],
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.gitkeep'],
    }),
    new MonacoWebpackPlugin({
      languages: ['css', 'less', 'scss'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ]
};