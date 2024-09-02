import * as path from 'path';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

module.exports = {
  entry: {
    main: "ts/src/main.ts"
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx"]
  },
  module: {
    rules: [
      { test: /\.tsx/, loader: 'ts-loader'}
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './html'
      }
    ])
  ]
};
