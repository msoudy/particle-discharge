const webpack = require('webpack');
const Merge = require('webpack-merge');
const devConfig = require('./client.config.js');
const backend = require('./server.config.js')

let clientConfig = Merge(devConfig, {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    })
  ]
})

module.exports = [
  clientConfig,
  backend
];

