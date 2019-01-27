const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const fs = require('fs')
const path = require('path')

const appsDir = path.resolve(__dirname, 'src', 'apps')
const outDirName = 'out'
const outDirPath = path.resolve(__dirname, outDirName)

const files = fs.readdirSync(appsDir)
    .map(filePath => {
        const name = path.parse(filePath).name
        return {
            file: filePath,
            outPath: `html/${name}.html`,
            name
        }
    })

const entries = files.reduce((obj, curr) => {
    obj[curr.name] = curr.file
    return obj
}, {})

entries['index'] = 'index.ts'

const plugins = [
        new CleanWebpackPlugin(outDirName)
    ]
    .concat(
        files.map(file => new HtmlWebpackPlugin({
            title: file.title || file.name,
            chunks: [file.name, 'vendor', 'runtime'],
            filename: file.outPath
        }))
    )
    .concat([
        new HtmlWebpackPlugin({
            title: 'Snekw\'s Playground',
            template: '!!handlebars-loader!src/index.hbs',
            chunks: ['index'],
            apps: files.map(v => ({
                name: v.name,
                outPath: v.outPath
            }))
        }),
        new webpack.HashedModuleIdsPlugin()
        // new webpack.DefinePlugin({
        //     APPS: JSON.stringify(files.map(v => ({
        //         name: v.name,
        //         outPath: v.outPath
        //     })))
        // })
    ])

module.exports = {
    mode: 'development',
    entry: entries,
    module: {
        rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(frag|vert)$/,
                use: 'raw-loader',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: outDirPath,
        compress: true,
        writeToDisk: true
    },
    output: {
        filename: 'js/[name].[contenthash].js',
        chunkFilename: 'js/[name].[contenthash].js',
        path: outDirPath
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'src', 'apps'),
            'node_modules'
        ]
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },
    plugins
}
