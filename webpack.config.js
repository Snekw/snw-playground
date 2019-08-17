const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const path = require('path')
const orderManager = require('./tools/orderManager')
const showdown = require('showdown')
const converter = new showdown.Converter()

const appsDir = path.resolve(__dirname, 'src', 'apps')
const appOutDirName = 'out'
const appOutDirPath = path.resolve(__dirname, appOutDirName)

const title = 'Snekw\'s Playground'

const apps = fs
    .readdirSync(appsDir)
    .map(filePath => {
        let meta
        let indexPath
        let markdown = ''
        try {
            meta = JSON.parse(fs.readFileSync(path.join(appsDir, filePath, 'meta.json')))
            indexPath = path.join(filePath, meta.index || '')
        } catch (err) {
            console.error(err)
            throw "meta.json file missing or malformed"
        }
        try {
            markdown = fs.readFileSync(path.join(appsDir, filePath, meta.readme || '')).toString()
        } catch (e) {
            console.log(`${meta.title} contained no readme.`)
        }
        const name = path.parse(filePath).name
        const readme = converter.makeHtml(markdown)
        return {
            title: meta.title,
            file: indexPath,
            outPath: `${name}/${name}.html`,
            name,
            readmePath: `${name}/${name}-readme.html`,
            readmeContent: readme
        }
    })

const makeEntries = (fileObjs) => fileObjs
    .reduce((obj, curr) => {
        obj[ curr.name ] = curr.file
        return obj
    }, {})

const appEntries = makeEntries(apps)
appEntries[ 'index' ] = 'index.ts'

const order = orderManager.getCurrentOrder()

function findAppIndex(app) {
    return order.order.findIndex(a => a === app)
}

const appsList = apps
    .sort((a, b) => findAppIndex(a.name) - findAppIndex(b.name))
    .map((a, i) => {
        // order added to the app info because of a bug that prevents the usage of @index in the index.hbs file
        a.order = i
        return a
    })

module.exports = (env, argv) => {
    const prod = argv.mode === 'production'

    return {
        name: 'apps',
        target: 'web',
        mode: 'development',
        entry: appEntries,
        module: {
            rules: [ {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(frag|vert|transform)$/,
                use: 'raw-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
            ]
        },
        devtool: prod ? false : 'inline-source-map',
        devServer: {
            contentBase: appOutDirPath,
            compress: true
        },
        output: {
            filename: prod ? '[name]/[contenthash].js' : '[name]/[name].js',
            path: appOutDirPath
        },
        resolve: {
            extensions: [ '.ts', '.tsx', '.js' ],
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
            new CleanWebpackPlugin()
        ]
            .concat(
                apps.map(file => new HtmlWebpackPlugin({
                    title: file.title || file.name,
                    chunks: [ file.name, 'vendor', 'runtime' ],
                    filename: file.outPath
                }))
            )
            .concat(
                apps.map(file => new HtmlWebpackPlugin({
                    title: file.title || file.name,
                    template: '!!handlebars-loader!src/readme.hbs',
                    // chunks: [file.name, 'vendor', 'runtime'],
                    chunks: [],
                    filename: file.readmePath,
                    readmeContent: file.readmeContent
                }))
            )
            .concat([
                new HtmlWebpackPlugin({
                    title,
                    template: '!!handlebars-loader!src/index.hbs',
                    chunks: [ 'index' ],
                    apps: appsList,
                    app: {
                        title
                    }
                }),
                new MiniCssExtractPlugin({
                    filename: 'css/[name].[contenthash].css'
                }),
                new webpack.DefinePlugin({
                    APPS: JSON.stringify(appsList),
                    DEBUG: JSON.stringify(!prod)
                })
            ])
    }
}
