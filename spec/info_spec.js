const uuid = require('node-uuid');
const values = require('object.values');

const {assertResponse, caught, request} = require('./spec_helper');

describe('Info API', () => {

    const port = Math.round(1000 + Math.random() * 60000);

    let ServerFactory, state, now, server;
    beforeEach(() => {
        ServerFactory = require('../src/server_factory');
        now = Date.now();
        spyOn(uuid, 'v4').and.returnValue('GUID');
        spyOn(Date, 'now').and.returnValue(now);
    });

    afterEach(() => {
        server && server.close();
    });

    describe('GET /v2/info', () => {
        beforeEach(done => {
            state = {
                info: {
                    name: 'vcap',
                    build: '2222',
                    support: 'http://support.cloudfoundry.com',
                    version: 2,
                    description: 'Cloud Foundry sponsored by Pivotal',
                    authorization_endpoint: 'http://localhost:8080/uaa',
                    token_endpoint: 'http://localhost:8080/uaa',
                    min_cli_version: null,
                    min_recommended_cli_version: null,
                    api_version: '2.63.0',
                    app_ssh_endpoint: 'ssh.system.domain.example.com:2222',
                    app_ssh_host_key_fingerprint: '47:0d:d1:c8:c3:3d:0a:36:d1:49:2f:f2:90:27:31:d0',
                    app_ssh_oauth_client: null,
                    routing_endpoint: 'http://localhost:3000',
                    logging_endpoint: 'ws://loggregator.vcap.me:80'
                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Get Info', done => {
            const method = 'get';
            const path = '/v2/info';
            request({method, port, path})
                .then(assertResponse(state.info))
                .then(done)
                .catch(caught(done));
        });
    });

});