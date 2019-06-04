var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var config = {
    entry: path.join(__dirname, './src/main.js'),
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'js/[name].js',
    },
    resolve: {
        alias: { //别名
            $: 'jquery/dist/jquery.js'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.html'),//html模板路径
            filename: 'index.html',//生成的html存放路径，相对于 path
            inject: true, //允许插件修改哪些内容，包括head与body
            hash: false,//为静态资源生成hash值
            minify: {
                collapseWhitespace: true,//删除空白符
                removeComments: true,//移除注释
                removeAttributeQuotes: true
            },
        }),
        new webpack.ProvidePlugin({
            '$': 'jquery'//无需import直接使用
        }),

        new ExtractTextWebpackPlugin("css/[name].css"),//提取css的插件
        new OptimizeCssAssetsPlugin(['dist'])// 压缩CSS的插件
    ],
    // 提取公共代码

    optimization: {
        // 找到chunk中共享的模块,取出来生成单独的chunk
        splitChunks: {
            chunks: "all",  // async表示抽取异步模块，all表示对所有模块生效，initial表示对同步模块生效
            cacheGroups: {
                vendors: {  // 抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,     // 指定是node_modules下的第三方包
                    name: "vendors",
                    priority: -10,                    // 抽取优先级

                },
                utilCommon: {   // 抽离自定义工具库
                    name: "common",
                    minSize: 0,     // 将引用模块分离成新代码文件的最小体积
                    minChunks: 2,   // 表示将引用模块如不同文件引用了多少次，才能分离生成新chunk
                    priority: -20
                }
            }
        },
        // 为 webpack 运行时代码创建单独的chunk
        runtimeChunk: {
            name: 'manifest'
        }
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-withimg-loader'
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/, //排出node_modules里面的js文件
            },
            {
                test: /\.css$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: "style-loader",//从哪里取出样式
                    use: ["css-loader", {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require("autoprefixer")
                            ]
                        }
                    }]//顺序是由后向前查找
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', {
                        loader: "postcss-loader",//自动兼容前缀
                        options: {
                            plugins: [
                                require("autoprefixer")//自动兼容前缀
                            ]
                        }
                    }, "less-loader"]
                })
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|svg|eot|ttf)$/,
                use: ['url-loader?limit=8192&name=assets/[name].[ext]']
            },
            {
                test: /\.mp3$/,
                use: ['file-loader?limit=8192&name=assets/[name].[ext]']
            }
        ]
    }
};
module.exports = config;