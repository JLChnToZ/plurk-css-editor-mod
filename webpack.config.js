const webpack = require('webpack');
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ]
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new MonacoWebpackPlugin({
      languages: ['css', 'less', 'scss'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    /*new PrepackWebpackPlugin({
      prepack: {
        speculate: true,
        trace: true,
        singlePass: true
      }
    }),*/
  ]
};