const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const path = require('path')

const appsDir = path.resolve(__dirname, 'src', 'apps')
const workersDir = path.resolve(__dirname, 'src', 'workers')
const appOutDirName = 'out'
const workersOutDirName = 'workers'
const appOutDirPath = path.resolve(__dirname, appOutDirName)
const workersOutDirPath = path.resolve(__dirname, appOutDirName, workersOutDirName)

const title = 'Snekw\'s Playground'

const apps = fs
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

const workers = fs
    .readdirSync(workersDir)
    .map(filePath => ({
        file: path.join(workersOutDirName, filePath),
        name: path.parse(filePath).name
    }))

const makeEntries = (fileObjs) => fileObjs
    .reduce((obj, curr) => {
        obj[curr.name] = curr.file
        return obj
    }, {})

const appEntries = makeEntries(apps)
appEntries['index'] = 'index.ts'

const workerEntries = makeEntries(workers)

module.exports = (env, argv) => {
    const prod = argv.mode === 'production'

    return [{
            name: 'apps',
            target: 'web',
            mode: 'development',
            entry: appEntries,
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
                        test: /\.scss$/,
                        use: [
                            prod ? 'style-loader' : MiniCssExtractPlugin.loader,
                            'css-loader',
                            'sass-loader'
                        ]
                    }
                ]
            },
            devtool: 'inline-source-map',
            devServer: {
                contentBase: appOutDirPath,
                compress: true
            },
            output: {
                filename: prod ? 'js/[contenthash].js' : 'js/[name].js',
                path: appOutDirPath
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
                moduleIds: prod ? 'hashed' : 'named',
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
            plugins: [
                    new CleanWebpackPlugin(appOutDirName)
                ]
                .concat(
                    apps.map(file => new HtmlWebpackPlugin({
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
                        apps: apps.sort((a, b) => a.order - b.order),
                        app: {
                            title
                        }
                    }),
                    new MiniCssExtractPlugin({
                        filename: 'css/[name].[contenthash].css'
                    })
                ])
        },
        // workers
        // {
        //     name: 'workers',
        //     target: 'webworker',
        //     mode: 'development',
        //     entry: workerEntries,
        //     module: {
        //         rules: [{
        //                 test: /\.tsx?$/,
        //                 use: 'ts-loader',
        //                 exclude: /node_modules/
        //             },
        //             {
        //                 test: /\.(frag|vert)$/,
        //                 use: 'raw-loader',
        //                 exclude: /node_modules/
        //             }
        //         ]
        //     },
        //     devtool: 'inline-source-map',
        //     devServer: {
        //         contentBase: workersOutDirPath,
        //         compress: true
        //     },
        //     output: {
        //         filename: prod ? '[contenthash].worker.js' : '[name].worker.js',
        //         path: workersOutDirPath
        //     },
        //     resolve: {
        //         extensions: ['.ts', '.tsx', '.js'],
        //         modules: [
        //             path.resolve(__dirname, 'src'),
        //             path.resolve(__dirname, 'src', 'workers'),
        //             'node_modules'
        //         ]
        //     },
        //     optimization: {
        //         moduleIds: prod ? 'hashed' : 'named'
        //     },
        //     plugins: []
        // }
    ]
}
