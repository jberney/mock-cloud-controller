const fs = require('fs');
const https = require('https');
const path = require('path');

const AppFactory = require('./app_factory');

const key = fs.readFileSync(path.resolve(__dirname, '..', 'sslcert', 'key.pem'), 'utf8');
const cert = fs.readFileSync(path.resolve(__dirname, '..', 'sslcert', 'cert.pem'), 'utf8');
const credentials = {key, cert};

module.exports = {
    newServer({state, port}, callback) {
        return https.createServer(credentials, AppFactory.newApp(state))
            .listen(port, callback);
    }
};