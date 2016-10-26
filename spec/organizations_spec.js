const uuid = require('node-uuid');

const {request, assertResponse, caught} = require('./spec_helper');

describe('Organizations API', () => {

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

    describe('POST /v2/organizations/', () => {
        beforeEach(done => {
            state = {organizations: {}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Creating an Organization', done => {
            const method = 'post';
            const path = '/v2/organizations/';
            const entity = {
                name: 'NAME',
                status: 'STATUS',
                quota_definition_guid: 'QUOTA_DEFINITION_GUID'
            };
            const expected = {
                metadata: {
                    guid: 'GUID',
                    url: '/v2/organizations/GUID',
                    created_at: new Date(now).toISOString(),
                    updated_at: new Date(now).toISOString()
                },
                entity
            };
            request({method, port, path, body: entity})
                .then(assertResponse(jasmine.objectContaining(expected)))
                .then(() => {
                    expect(state.organizations.GUID)
                        .toEqual(jasmine.objectContaining(expected));
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('DELETE /v2/organizations/:guid', () => {
        beforeEach(done => {
            state = {organizations: {ORG_GUID: {}}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Delete a Particular Organization', done => {
            const method = 'delete';
            const path = '/v2/organizations/ORG_GUID';
            request({method, port, path})
                .then(assertResponse())
                .then(() => {
                    expect(state.organizations.ORG_GUID).toBeFalsy();
                })
                .then(done)
                .catch(caught(done));
        });
    });

});