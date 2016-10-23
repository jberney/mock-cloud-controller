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
        spyOn(Math, 'random').and.returnValue(0);
    });

    afterEach(() => {
        server && server.close();
    });

    describe('POST /v2/apps', () => {
        beforeEach(done => {
            state = {
                apps: {},
                spaces: {SPACE_GUID: {entity: {organization_guid: 'ORG_GUID'}}}
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating an App', done => {
            const method = 'post';
            const path = '/v2/apps';
            const entity = {
                name: 'NAME',
                status: 'STATUS',
                package_state: 'PENDING',
                space_guid: 'SPACE_GUID'
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
                    organization_guid: 'ORG_GUID',
                    package_state: 'STAGED',
                    space_guid: 'SPACE_GUID',
                    stack_guid: 'STACK_GUID'
                }
            };
            request({method, port, path, body: entity})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.apps.GUID)
                        .toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('PUT /v2/apps/:guid', () => {
        beforeEach(done => {
            state = {
                apps: {
                    APP_GUID: {
                        metadata: {
                            guid: 'APP_GUID'
                        },
                        entity: {
                            name: 'NAME'
                        }
                    }
                },
                events: {}
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Starts an App', done => {
            const method = 'put';
            const path = '/v2/apps/APP_GUID';
            const entity = {
                state: 'STARTED'
            };
            const expected = {
                entity: {
                    name: 'NAME',
                    state: 'STARTED'
                }
            };
            request({method, port, path, body: entity})
                .then(assertResponse(jasmine.objectContaining(expected)))
                .then(() => {
                    expect(state.apps.APP_GUID.entity.state)
                        .toBe('STARTED');
                })
                .then(() => {
                    expect(state.events.GUID.entity.actee).toBe('APP_GUID');
                    expect(state.events.GUID.entity.type).toBe('audit.app.create');
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('PUT /v2/apps/:guid/routes/:route_guid', () => {
        beforeEach(done => {
            state = {
                routes: {
                    ANOTHER_ROUTE_GUID: {
                        metadata: {
                            guid: 'ANOTHER_ROUTE_GUID'
                        },
                        entity: {
                            name: 'ANOTHER_ROUTE'
                        }
                    }
                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Associate Route with the App, List all Routes for the App', done => {
            const method = 'put';
            const path = '/v2/apps/APP_GUID/routes/ROUTE_GUID';
            const putExpected = {
                metadata: {
                    guid: 'ROUTE_GUID',
                    url: '/v2/routes/ROUTE_GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    name: 'name-0'
                }
            };
            const getExpected = {
                total_results: 1,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources: [putExpected]
            };
            request({method, port, path})
                .then(assertResponse(putExpected))
                .then(() => request({
                    method: 'get',
                    port,
                    path: '/v2/apps/APP_GUID/routes'
                }))
                .then(assertResponse(getExpected))
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

    describe('GET /v2/apps/:guid/env', () => {
        beforeEach(done => {
            server = ServerFactory.newServer({port}, done);
        });
        it('Get the env for an App', done => {
            const method = 'get';
            const path = '/v2/apps/APP_GUID/env';
            const expected = {};
            request({method, port, path})
                .then(assertResponse(jasmine.objectContaining(expected)))
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