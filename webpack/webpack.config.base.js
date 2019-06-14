
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const paths = {
  'assets': path.resolve(__dirname, '../www/assets'),
  'src': path.resolve(__dirname, '../src')
};

module.exports = function () {
  return {
    context: paths.src,
    entry: {
      app: ['./main.js']
    },
    output: {
      filename: 'lib-[hash:8].js',
	  publicPath: '',
      path: path.resolve(__dirname, '../www')
    },
	resolve: {
		extensions: [ '.es6', '.js' ]
	},
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.es6$/,
          exclude: /node_modules/,
          use: ['eslint-loader']
        },
        {
		  test: /(\.es6|\.js)$/,
		  exclude: /node_modules\/(?!(markdown-it-anchor)\/).*/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [ [
					"env", {
						"modules": false,
						"browser": true,
						"targets": {
							"browsers": [ '> 1%', 'firefox > 35', 'chrome >= 30', 'safari >= 5', 'IE >= 8' ]
						}
					}
				] ]
              }
            }
          ]
        },
        {
          test: /\.(svg|png|jpg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: 'images/[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|otf|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: 'fonts/[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(mp4|ogg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
            {
                test: /\.(json)$/,
                loader: 'file-loader?name=events/[name].[ext]'
            },
            {
                test: /\.(list)$/,
                loader: 'file-loader?name=events/[name].[ext]'
            },
            {
                test: /\.(gdml)$/,
                loader: 'file-loader?name=gdml/[name].[ext]'
            }
      ]
    },
	"plugins": [
		new webpack.optimize.LimitChunkCountPlugin({
		    maxChunks: 1
  		}),
		new webpack.NoEmitOnErrorsPlugin(),
        new CopyWebpackPlugin([
            { "from": "../LICENSE", "to": "../www/LICENSE", "flatten": true },
            { "from": "../src/fonts/*.json", "to": "../www/fonts", "flatten": true },

            { "from": "**/*.json", "to": "../www/events", "flatten": false, "context": "../src/events/" },
            { "from": "**/*.json.gz", "to": "../www/events", "flatten": false, "context": "../src/events/" },
            { "from": "**/*.list", "to": "../www/events", "flatten": false, "context": "../src/events/" },

            { "from": "**/*.json", "to": "../www/gdml", "flatten": false, "context": "../src/gdml/" },
            { "from": "**/*.gdml", "to": "../www/gdml", "flatten": false, "context": "../src/gdml/" },
            { "from": "**/*.gdml.gz", "to": "../www/gdml", "flatten": false, "context": "../src/gdml/" },
        ]),
	   	new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new HtmlWebpackPlugin({
            title: 'EVENT DISPLAY',
            inject: 'head'
        })
	]
  };
};
