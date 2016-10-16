const uuid = require('node-uuid');

const {request, assertResponse, caught} = require('./spec_helper');

describe('Users API', () => {

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

    describe('POST /v2/users', () => {
        beforeEach(done => {
            state = {users: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating an Organization', done => {
            const method = 'post';
            const path = '/v2/users';
            const guid = 'guid-cb24b36d-4656-468e-a50d-b53113ac6177';
            const body = {guid};
            const expected = {
                metadata: {
                    guid,
                    url: `/v2/users/${guid}`,
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                }
            };
            request({method, port, path, body})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.users[guid]).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
    });

});