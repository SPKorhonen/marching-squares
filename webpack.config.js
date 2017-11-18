// todo: uglify - https://github.com/webpack-contrib/uglifyjs-webpack-plugin

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const isProdBuild = process.argv.indexOf("-p") !== -1;
const ROOT = path.resolve(__dirname, 'src');
const DESTINATION = path.resolve(__dirname, 'dist');

module.exports = {
    context: ROOT,

    entry: {
        'main': './main.ts'
    },

    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },

    module: {
        rules: [
            /****************
            * PRE-LOADERS
            *****************/
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },

            /****************
            * LOADERS
            *****************/
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'awesome-typescript-loader'
            }
        ]
    },

    devtool: 'cheap-module-source-map',
    devServer: {},
    plugins: isProdBuild ? [
        new UglifyJsPlugin({
            uglifyOptions: {
                ie8: false,
                ecma: 5,
                mangle: true,
                output: {
                    comments: false,
                    beautify: false,
                },
                compress: true,
                warnings: true
            }
        })
    ] : []
};

