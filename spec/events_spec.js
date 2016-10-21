const uuid = require('node-uuid');

const {request, assertResponse, caught} = require('./spec_helper');

describe('Events API', () => {

    const port = Math.round(1000 + Math.random() * 60000);

    let ServerFactory, state, now, server;
    beforeEach(() => {
        ServerFactory = require('../src/server_factory');
        now = Date.now();
        spyOn(uuid, 'v4').and.returnValue('GUID');
        spyOn(Date, 'now').and.returnValue(now);
        state = {
            events: {
                GUID_1: {
                    metadata: {
                        guid: 'GUID_1'
                    },
                    entity: {
                        actee: 'NOT_ACTEE',
                        type: 'TYPE_1'
                    }
                },
                GUID_2: {
                    metadata: {
                        guid: 'GUID_2'
                    },
                    entity: {
                        actee: 'ACTEE',
                        type: 'TYPE_1'
                    }
                },
                GUID_3: {
                    metadata: {
                        guid: 'GUID_3'
                    },
                    entity: {
                        actee: 'ACTEE',
                        type: 'TYPE_2'
                    }
                },
                GUID_4: {
                    metadata: {
                        guid: 'GUID_4'
                    },
                    entity: {
                        actee: 'ACTEE',
                        type: 'TYPE_3'
                    }
                }
            }
        };
    });

    afterEach(() => {
        server && server.close();
    });

    describe('GET /v2/events', () => {
        beforeEach(done => {
            server = ServerFactory.newServer({port, state}, done);
        });
        it('List all Events filtered by actee and type', done => {
            const method = 'get';
            const path = '/v2/events?q=actee:ACTEE&q=type%20IN%20TYPE_1,TYPE_2';
            const expected = {
                total_results: 2,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources: [
                    state.events.GUID_2,
                    state.events.GUID_3
                ]
            };
            request({method, port, path})
                .then(assertResponse(jasmine.objectContaining(expected)))
                .then(done)
                .catch(caught(done));
        });
    });

});