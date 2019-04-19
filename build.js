'use strict'
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const webpackConfig = {
  mode: 'production',
  entry: {
    index: 'src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      src: path.resolve(__dirname, 'src')
    }
  },
  externals: {
    vue: 'Vue'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

const spinner = ora('building vue-img-cropper')
spinner.start()
webpack(webpackConfig, (err, stats) => {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  if (stats.hasErrors()) {
    console.log(chalk.red('  Build failed with errors.\n'))
    process.exit(1)
  }

  console.log(chalk.cyan('  Build complete.\n'))
})
