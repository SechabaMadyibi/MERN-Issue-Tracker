/*
 eslint-disable import/no-extraneous-dependencies
*/
const webpack = require('webpack');
const merge = require('webpack-merge');
const serverConfig = require('./webpack.config.js')[1];
module.exports = merge(serverConfig, {
 entry: { server: ['./node_modules/webpack/hot/poll?1000'] },
 plugins: [
 new webpack.HotModuleReplacementPlugin(),
 ],
});

// chapter 12
// Now, the server bundle can be rebuilt on changes if you run Webpack with this file as the configuration
// with the watch option. Also, it will let the running server listen for changes and load up the changed modules