const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',

  devtool: 'source-map',

  //https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: __dirname + '/dist',
    compress: true,
    port: 8080,
    noInfo: true,
    clientLogLevel: 'debug',
  },

  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      loader: 'source-map-loader'
    }],
  },
})
