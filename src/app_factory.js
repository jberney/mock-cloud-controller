const bodyParser = require('body-parser');
const express = require('express');

const RouterFactory = require('./router_factory');

module.exports = {
    newApp(state) {
        const app = express();
        app.use(function (req, res, next) {
            console.log(`[CC] ${req.method} ${req.url}`);
            req.body && console.log(req.body);
            next();
        });
        app.use(bodyParser.json());
        app.use('/v2', RouterFactory.newRouter(state));
        return app;
    }
};