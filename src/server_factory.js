const AppFactory = require('./app_factory');

module.exports = {
    newServer(state, port, callback) {
        return AppFactory.newApp(state).listen(port, callback);
    }
};