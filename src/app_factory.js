const bodyParser = require('body-parser');
const express = require('express');

const RouterFactory = require('./router_factory');

module.exports = {
  newApp({state, logs}) {
    const app = express();
    app.use(bodyParser.json());
    app.use(function (req, res, next) {
      let log = `[CC] ${req.method} ${req.url}`;
      if (['POST', 'PUT'].includes(req.method)) log = `${log} ${JSON.stringify(req.body)}`;
      console.log(log);
      next();
    });
    app.use('/v2', RouterFactory.newRouter({state, logs}));
    return app;
  }
};