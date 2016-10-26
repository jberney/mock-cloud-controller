const {request, assertResponse, caught} = require('./spec_helper');

describe('Feature Flags API', () => {

    const port = Math.round(1000 + Math.random() * 60000);

    let ServerFactory, state, now, server;
    beforeEach(() => {
        ServerFactory = require('../src/server_factory');
    });

    afterEach(() => {
        server && server.close();
    });

    describe('GET /v2/config/feature_flags/set_roles_by_username', () => {
        beforeEach(done => {
            server = ServerFactory.newServer({port}, done);
        });
        it('Get the Set User Roles feature flag', done => {
            const method = 'get';
            const path = '/v2/config/feature_flags/set_roles_by_username';
            const expected = {name: 'set_roles_by_username', enabled: true};
            request({method, port, path})
                .then(assertResponse(expected))
                .then(done)
                .catch(caught(done));
        });
    });

});