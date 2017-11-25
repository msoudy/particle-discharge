const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './app.js',
  output: {
    filename: 'backend.js',
    path: path.resolve(__dirname, '../server')
  },
  target: 'node',
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/)
  ],
  devtool: 'source-map',
}