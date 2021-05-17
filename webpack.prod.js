const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode : 'production',
    output : {
        filename : '[name]-[contenthash].js',
        path : path.resolve(__dirname, 'dist')
    },
    optimization : {
        minimizer : [
            new CssMinimizerPlugin(), new TerserPlugin(), 
            new HtmlWebpackPlugin({
                template : './src/template.html',
                minify : {
                    removeAttributeQuotes : true,
                    removeComments : true,
                    removeTagWhitespace : true,
                    collapseWhitespace : true
                }
            })
        ]
    },
    plugins : [
        new MiniCssExtractPlugin({
            filename : 'style-[contenthash].css'    
        }), 
        new CleanWebpackPlugin()
    ],
    module : {
        rules : [
            {
                test : /\.scss$/,
                use : [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
});