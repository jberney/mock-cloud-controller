const uuid = require('node-uuid');
const values = require('object.values');

const {assertResponse, caught, request} = require('./spec_helper');

describe('Service Bindings API', () => {

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

    describe('GET /v2/service_bindings', () => {
        beforeEach(done => {
            state = {
                service_bindings: {
                    SERVICE_BINDING_GUID: {
                        metadata: {
                            guid: 'SERVICE_BINDING_GUID'
                        },
                        entity: {
                            name: 'NAME',
                            app_guid: 'APP_GUID'
                        }
                    },
                    ANOTHER_SERVICE_BINDING_GUID: {
                        metadata: {
                            guid: 'ANOTHER_SERVICE_BINDING_GUID'
                        },
                        entity: {
                            name: 'ANOTHER_NAME',
                            app_guid: 'ANOTHER_APP_GUID'
                        }
                    }

                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('List all Service Bindings', done => {
            const method = 'get';
            const path = '/v2/service_bindings';
            request({method, port, path})
                .then(assertResponse({
                    total_results: 2,
                    total_pages: 1,
                    prev_url: null,
                    next_url: null,
                    resources: values(state.service_bindings)
                }))
                .then(done)
                .catch(caught(done));
        });
        it('List all Service Bindings where app_guid is APP_GUID', done => {
            const method = 'get';
            const path = '/v2/service_bindings?q=app_guid:APP_GUID';
            request({method, port, path})
                .then(assertResponse({
                    total_results: 1,
                    total_pages: 1,
                    prev_url: null,
                    next_url: null,
                    resources: [state.service_bindings.SERVICE_BINDING_GUID]
                }))
                .then(done)
                .catch(caught(done));
        });
    });

    describe('POST /v2/service_bindings', () => {
        beforeEach(done => {
            state = {
                service_bindings: {}
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Create a Service Binding', done => {
            const method = 'post';
            const path = '/v2/service_bindings';
            const body = {
                app_guid: 'APP_GUID',
                service_instance_guid: 'SERVICE_INSTANCE_GUID'
            };
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/service_bindings/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity: {
                    app_guid: 'APP_GUID',
                    service_instance_guid: 'SERVICE_INSTANCE_GUID',
                    credentials: {pass: 'word', user: 'name'},
                    name: 'name-0'
                }
            };
            request({method, port, path, body})
                .then(assertResponse(expected))
                .then(done)
                .catch(caught(done));
        });
    });

});