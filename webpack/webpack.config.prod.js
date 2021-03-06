const webpackMerge = require('webpack-merge');
const webpackConfigBase = require('./webpack.config.base.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const paths = {
  'base': path.resolve(__dirname, '../'),
  'static': path.resolve(__dirname, '../src/static')
};

module.exports = function() {
  return webpackMerge(webpackConfigBase(), {
    output: {
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  plugins: function () {
                    return [
                      require('postcss-import'),
                      // require('stylelint')(),
                      // require('postcss-reporter')(),
                      require('postcss-cssnext')({
                        features: {
                          autoprefixer: {
                            grid: false
                          }
                        }
                      }),
                      require('postcss-nested'),
                      require('postcss-remove-root'),
                      require('css-mqpacker')({
                        sort: true
                      }),
                      require('cssnano')({
                        autoprefixer: false,
                        safe: true
                      })
                    ];
                  }
                }
              }
            ]
          })
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('lib-[hash:8].css'),
      new CleanWebpackPlugin(['www'], { root: paths.base })
    ]
  })
};
