var webpack = require("webpack");

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'es2015',
            'stage-0',
            'stage-1',
            'stage-2',
            'stage-3'
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  devtool: 'source-map',
  node: {
    fs: 'empty'
  }
};
