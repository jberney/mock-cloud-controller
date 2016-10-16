const https = require('https');
const {pki} = require('node-forge');

const AppFactory = require('./app_factory');

const attrs = [{
    name: 'commonName',
    value: 'localhost'
}, {
    name: 'countryName',
    value: 'some-country'
}, {
    shortName: 'ST',
    value: 'some-state'
}, {
    name: 'localityName',
    value: 'some-locality'
}, {
    name: 'organizationName',
    value: 'some-org'
}, {
    shortName: 'OU',
    value: 'some-org-unit'
}];

const keys = pki.rsa.generateKeyPair(2048);
const key = pki.privateKeyToPem(keys.privateKey);

const certificate = pki.createCertificate();
certificate.publicKey = keys.publicKey;
certificate.serialNumber = '01';
certificate.validity.notBefore = new Date();
certificate.validity.notAfter = new Date();
certificate.setSubject(attrs);
certificate.setIssuer(attrs);
certificate.sign(keys.privateKey);

const cert = pki.certificateToPem(certificate);

const credentials = {key, cert};

module.exports = {
    newServer({state, port}, callback) {
        return https.createServer(credentials, AppFactory.newApp(state))
            .listen(port, callback);
    }
};