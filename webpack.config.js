const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const path = require('path')

const appsDir = path.resolve(__dirname, 'src', 'apps')
const appOutDirName = 'out'
const appOutDirPath = path.resolve(__dirname, appOutDirName)

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
            outPath: `${name}/${name}.html`,
            name,
            order: meta.order || Number.MAX_SAFE_INTEGER
        }
    })

const makeEntries = (fileObjs) => fileObjs
    .reduce((obj, curr) => {
        obj[curr.name] = curr.file
        return obj
    }, {})

const appEntries = makeEntries(apps)
appEntries['index'] = 'index.ts'


module.exports = (env, argv) => {
    const prod = argv.mode === 'production'

    return {
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
    }
}
