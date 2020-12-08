// Webpack configuration for web-based integration tests
// webpack.config.webtest.int.js

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const babelRule = {
  test: /\.js$/,
  // exclude: /(node_modules)/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env']
    }
  }
}

module.exports = [
  {
    // mode: 'development',
    entry: {
      app: './test/int/inttest-ALL.js'
    },
    target: 'web', // default
    devtool: 'inline-source-map', // original code
    // devtool : 'cheap-module-eval-source-map',
    output: {
      path: path.resolve(__dirname, 'test_bundles'),
      libraryTarget: 'umd',
      library: 'js8path-route',
      filename: 'js8path-route-webtest-int.js'
    },
    devServer: {
      // this contentBase serves mocha & chai from node_modules in parent directory
      // comment it out to serve from this package's node_modules
      contentBase: path.join(__dirname, '..'),
      port: 8081
    },
    module: {
      rules: [ babelRule ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'js8path-route-webtest-int.html',
        template: 'test/int/template-test.html',
        title: 'Mocha Integration Tests for js8path-route.js (from template)',
        minify: false,
        inject: false,
        hash: true
      })
    ]
  }
]
