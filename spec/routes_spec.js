const uuid = require('node-uuid');

const {request, assertResponse, caught} = require('./spec_helper');

describe('Routes API', () => {

    const port = Math.round(1000 + Math.random() * 60000);

    let ServerFactory, state, now, server;
    beforeEach(() => {
        ServerFactory = require('../src/server_factory');
        now = Date.now();
        spyOn(uuid, 'v4').and.returnValue('GUID');
        spyOn(Date, 'now').and.returnValue(now);
        spyOn(Math, 'random').and.returnValue(0);
    });

    afterEach(() => {
        server && server.close();
    });

    describe('POST /v2/routes', () => {
        beforeEach(done => {
            state = {routes: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating a Route', done => {
            const method = 'post';
            const path = '/v2/routes';
            const body = {
                host: 'HOST',
                domain_guid: 'DOMAIN_GUID',
                space_guid: 'SPACE_GUID'
            };
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/routes/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    name: 'name-0',
                    host: 'HOST',
                    domain_guid: 'DOMAIN_GUID',
                    space_guid: 'SPACE_GUID',
                    path: ''
                }
            };
            request({method, port, path, body})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.routes.GUID)
                        .toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
    });

});