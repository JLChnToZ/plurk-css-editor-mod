const { resolve } = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge({
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: __dirname + '/dist',
    jsonpFunction: 'customCSSWebpackJsonp',
  },
  resolve: {
    extensions: ['.ts', '.js']
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.gitkeep'],
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src', 'index.html'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        minifyCSS: true
      },
    }),
  ],

  node: {
    fs: 'empty',
  },

  module: {
    rules: [ {
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },{
      test: /\.ttf$/,
      use: 'file-loader',
    }],
  },
})
