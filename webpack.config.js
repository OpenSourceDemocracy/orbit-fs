'use strict'

const path = require('path')
const webpack = require('webpack')
const Uglify = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './built/index.js',
  output: {
    path: path.resolve(__dirname, './docs'),
    publicPath: './',
    filename: 'index.js'
  },
  module: {
    rules: [
        {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
    },
    ]
  },
  target: 'web',
  devtool: 'none',
  node: {
    console: false,
    Buffer: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/assets/index.html"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new Uglify(),
  ],
  externals: {
    'xhr2': 'XMLHttpRequest',
    'xmlhttprequest': 'XMLHttpRequest',
    'node-fetch': 'fetch',
    'text-encoding': 'TextEncoder',
    'urlutils': 'URL',
    'webcrypto': 'crypto'
  }, // in order to ignore all modules in node_modules folder from bundling

}
