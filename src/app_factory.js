const bodyParser = require('body-parser');
const express = require('express');

const ExpressProvider = require('./express_provider');
const RouterFactory = require('./router_factory');

module.exports = {
    newApp(state) {
        const app = ExpressProvider.get();
        app.use(bodyParser.json());
        app.use('/v2', RouterFactory.newRouter(state));
        return app;
    }
};