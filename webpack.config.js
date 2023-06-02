const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const ENTRY_FILE = '/src/index.js';
const PUBLIC_PATH = '/';
const OUTPUT_PATH = path.join(__dirname, '/dist');
const TEMPLATE_FILE = '/src/index.html';

module.exports = {
  entry: ENTRY_FILE,

  mode: process.env.NODE_ENV || 'production',

  output: {
    publicPath: PUBLIC_PATH,
    path: OUTPUT_PATH,
    filename: 'bundle.js',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: TEMPLATE_FILE,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css|scss$/i,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  devServer: {
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/': 'http://localhost:3000',
      secure: true,
      changeOrigin: true,
    },
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
