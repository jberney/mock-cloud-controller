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

});