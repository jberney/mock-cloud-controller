const uuid = require('node-uuid');
const values = require('object.values');

const {assertResponse, caught, request} = require('./spec_helper');

describe('Service Instances API', () => {

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

    describe('POST /v2/user_provided_service_instances', () => {
        describe('Create a User-Provided Service Instance', () => {
            beforeEach(done => {
                state = {user_provided_service_instances: {}};
                server = ServerFactory.newServer({state, port}, done);
            });
            it('succeeds', done => {
                const method = 'post';
                const path = '/v2/user_provided_service_instances';
                const entity = {
                    name: 'NAME',
                    route_group_guid: 'ROUTE_GROUP_GUID'
                };
                const expected = {
                    metadata: {
                        guid: 'GUID',
                        url: '/v2/user_provided_service_instances/GUID',
                        created_at: new Date(now).toISOString(),
                        updated_at: new Date(now).toISOString()
                    },
                    entity: {
                        name: 'NAME',
                        route_group_guid: 'ROUTE_GROUP_GUID',
                        type: 'user_provided_service_instance'
                    }
                };
                request({method, port, path, body: entity})
                    .then(assertResponse(expected))
                    .then(() => {
                        expect(state.user_provided_service_instances.GUID).toEqual(expected);
                    })
                    .then(done)
                    .catch(caught(done));
            });
        });
    });

});