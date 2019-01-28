const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const path = require('path')

const appsDir = path.resolve(__dirname, 'src', 'apps')
const outDirName = 'out'
const outDirPath = path.resolve(__dirname, outDirName)

const title = 'Snekw\'s Playground'

const files = fs
    .readdirSync(appsDir)
    .map(filePath => {
        let meta
        let indexPath
        try {
            meta = JSON.parse(fs.readFileSync(path.join(appsDir, filePath, 'meta.json')))
            indexPath = path.join(filePath, meta.index || '')
        } catch (err) {
            console.error(err)
            throw "meta.json file missing or malformed"
        }
        const name = path.parse(filePath).name
        return {
            title: meta.title,
            file: indexPath,
            outPath: `html/${name}.html`,
            name,
            order: meta.order || Number.MAX_SAFE_INTEGER
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
            title,
            template: '!!handlebars-loader!src/index.hbs',
            chunks: ['index'],
            apps: files.sort((a, b) => a.order - b.order),
            app: {
                title
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css'
        })
        // new webpack.DefinePlugin({
        //     APPS: JSON.stringify(files.map(v => ({
        //         name: v.name,
        //         outPath: v.outPath
        //     })))
        // })
    ])

module.exports = (env, argv) => ({
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
            },
            {
                test: /.scss$/,
                use: [
                    argv.mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: outDirPath,
        compress: true
    },
    output: {
        filename: 'js/[name].[contenthash].js',
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
})
