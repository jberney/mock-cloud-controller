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
        spyOn(Math, 'random').and.returnValue(0);
    });

    afterEach(() => {
        server && server.close();
    });

    describe('POST /v2/users', () => {
        beforeEach(done => {
            state = {users: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating a User', done => {
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
                entity: {name: 'name-0'}
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

    describe('PUT /v2/organizations/:guid/users', () => {
        beforeEach(done => {
            state = {organizations: {}, users: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Associate User with the Organization by Username', done => {
            const method = 'put';
            const path = '/v2/organizations/ORG_GUID/users';
            const body = {username: 'username'};
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/users/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    name: 'name-0',
                    username: 'username'
                }
            };
            request({method, port, path, body})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.users.GUID).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
        it('Associate "admin" User with the Organization by Username', done => {
            const method = 'put';
            const path = '/v2/organizations/ORG_GUID/users';
            const body = {username: ''};
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/users/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    name: 'name-0',
                    username: 'admin'
                }
            };
            request({method, port, path, body})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.users.GUID).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('DELETE /v2/organizations/:guid/users', () => {
        beforeEach(done => {
            state = { };
            server = ServerFactory.newServer({state, port}, () => {
                state.associations = {organizations: {ORG_GUID: {user_roles: ['USER_GUID']}}};
                done();
            });
        });
        it('Remove User from the Organization', done => {
            const method = 'delete';
            const path = '/v2/organizations/ORG_GUID/users/USER_GUID';
            request({method, port, path})
                .then(assertResponse())
                .then(() => {
                    expect(state.associations.organizations.ORG_GUID.user_roles.length).toBe(0);
                })
                .then(done)
                .catch(caught(done));
        });
    });

});