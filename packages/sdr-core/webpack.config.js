const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'output'),
    filename: 'index.js',
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  optimization: {
    minimize: false,
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {noEmit: false},
        },
      },
    ],
  },
};
