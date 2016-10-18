const uuid = require('node-uuid');

const {request, assertResponse, caught} = require('./spec_helper');

describe('Apps API', () => {

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

    describe('POST /v2/apps', () => {
        beforeEach(done => {
            state = {apps: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating an App', done => {
            const method = 'post';
            const path = '/v2/apps';
            const entity = {
                name: 'NAME',
                status: 'STATUS',
                package_state: 'PENDING'
            };
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/apps/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    name: 'NAME',
                    status: 'STATUS',
                    package_state: 'STAGED'
                }
            };
            request({method, port, path, body: entity})
                .then(assertResponse(jasmine.objectContaining(expected)))
                .then(() => {
                    expect(state.apps.GUID)
                        .toEqual(jasmine.objectContaining(expected));
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('PUT /v2/apps/:guid/bits', () => {
        beforeEach(done => {
            server = ServerFactory.newServer({port}, done);
        });
        it('Uploads the bits for an App', done => {
            const method = 'put';
            const path = '/v2/apps/APP_GUID/bits';
            const body = {a: 1, b: 2};
            request({method, port, path, body})
                .then(assertResponse(body))
                .then(done)
                .catch(caught(done));
        });
    });

    describe('GET /v2/apps/:guid/instances', () => {
        beforeEach(done => {
            server = ServerFactory.newServer({port}, done);
        });
        it('Get the instance information for a STARTED App', done => {
            const method = 'get';
            const path = '/v2/apps/APP_GUID/instances';
            const expected = {0: {state: 'running'}};
            request({method, port, path})
                .then(assertResponse(jasmine.objectContaining(expected)))
                .then(done)
                .catch(caught(done));
        });
    });

});