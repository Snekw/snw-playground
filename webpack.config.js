const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const path = require('path')

const appsDir = path.resolve(__dirname, 'src', 'apps')
const workersDir = path.resolve(__dirname, 'src', 'workers')
const outDirName = 'out'
const outDirPath = path.resolve(__dirname, outDirName)

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
        file: path.join(workersDir, filePath),
        name: `${path.parse(filePath).name}-worker`
    }))

const entries = apps
    .concat(workers)
    .reduce((obj, curr) => {
        obj[curr.name] = curr.file
        return obj
    }, {})

entries['index'] = 'index.ts'

const plugins = [
        new CleanWebpackPlugin(outDirName)
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

module.exports = (env, argv) => {
    const prod = argv.mode === 'production'

    return {
        target: 'web',
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
                        prod ? 'style-loader' : MiniCssExtractPlugin.loader,
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
            filename: prod ? 'js/[contenthash].js' : 'js/[name].js',
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
        plugins
    }
}
