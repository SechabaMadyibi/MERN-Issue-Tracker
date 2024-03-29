const express = require('express');
require('dotenv').config();
const proxy = require('http-proxy-middleware');
const app = express();


const enableHMR = (process.env.ENABLE_HMR || 'true') === 'true';
if (enableHMR && (process.env.NODE_ENV !== 'production')) {
 console.log('Adding dev middleware, enabling HMR');

 /* eslint "global-require": "off" */
 /* eslint "import/no-extraneous-dependencies": "off" */
 //To enable HMR, the first thing we’ll do is import the modules for Webpack and the two new modules
// we just installed. We’ll also have to let ESLint know that we have a special case where we are installing
// development dependencies conditionally, so a couple of checks can be disabled.
 const webpack = require('webpack');
 const devMiddleware = require('webpack-dev-middleware');
 const hotMiddleware = require('webpack-hot-middleware');
 const config = require('./webpack.config.js');

//  In the config, let’s add a new entry point for Webpack that will install a listener for changes to the UI
// code and fetch the new modules when they change.
 config.entry.app.push('webpack-hot-middleware/client');

 //Then, let’s enable the plugin for HMR, which can be instantiated using
//webpack.HotModuleReplacementPlugin().

 config.plugins = config.plugins || [];
 config.plugins.push(new webpack.HotModuleReplacementPlugin());

//  Finally, let’s create a Webpack compiler from this config and create the dev middleware (which does the
//     actual compilation of the code using the config and sends out the bundles) and the hot middleware (which
//     incrementally sends the new modules to the browser).

 const compiler = webpack(config);
 app.use(devMiddleware(compiler));
 app.use(hotMiddleware(compiler));
}

app.use(express.static('public'));

const apiProxyTarget = process.env.API_PROXY_TARGET;
if (apiProxyTarget) {
 app.use('/graphql', proxy({ target: apiProxyTarget }));
}


const UI_API_ENDPOINT = process.env.UI_API_ENDPOINT
 || 'http://localhost:3000/graphql';

const env = { UI_API_ENDPOINT };
app.get('/env.js', (req, res) => {
 res.send(`window.ENV = ${JSON.stringify(env)}`)
})
const port = process.env.UI_SERVER_PORT || 8000;

app.listen(port, () => {
    console.log(`UI started on port ${port}`);
});

