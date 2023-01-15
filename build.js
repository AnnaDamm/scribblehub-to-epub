import CompressionPlugin from 'compression-webpack-plugin'
import * as path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import { fileURLToPath } from 'url'
import webpack from 'webpack'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distFolder = path.resolve(__dirname, 'dist')
const outFileName = 'scribblehub-to-epub.js'

const webpackConfig = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'scribblehub-to-epub.js',
    path: distFolder
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new CompressionPlugin({
      include: outFileName,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false
      })
    ]
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset'
      }
    ]
  },
  experiments: {
    topLevelAwait: true
  }
}

const bundler = webpack(webpackConfig)

bundler.run(() => {})
