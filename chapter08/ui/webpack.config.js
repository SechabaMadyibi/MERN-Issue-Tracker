const path = require('path');
module.exports = {
    mode: 'development',
    entry: { app: ['./src/App.jsx'] },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    optimization: {
        splitChunks: {
        name: 'vendor',
        chunks: 'all',
        },
        },
        devtool: 'source-map'  
};

// let’s save some time by excluding libraries from transformation: they will already be transformed
// in the distributions that are provided. To do this, we need to exclude all files under node_modules in the
// Babel loader.

// enable the optimization splitChunks. This plugin does what we want out of the box, that is,
// it separates everything under node_modules into a different bundle. All we need to do is to say that we need
// "all" as the value to the property chunks