const http = require('http');
const uuid = require('node-uuid');

describe('Organizations API', () => {

    const host = 'localhost';
    const port = 9000;

    function request({method = 'get', path, body}) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                method,
                host,
                port,
                path,
                headers: {
                    'Content-Type': 'application/json',
                }
            }, response => {
                const chunks = []
                response.on('data', function (chunk) {
                    chunks.push(chunk);
                });
                response.on('end', function () {
                    try {
                        resolve(JSON.parse(chunks.join()));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            body && req.write(JSON.stringify(body));
            req.end();
        });
    };

    function assertResponse(expected) {
        return actual => {
            expect(actual).toEqual(expected);
        };
    }

    function caught(done) {
        return e => {
            expect(e).toBeFalsy();
            done();
        };
    }

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
            server = ServerFactory.newServer(state, port, done);
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
            request({method, path, body: entity})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.organizations.GUID).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('DELETE /v2/organizations/:guid', () => {
        beforeEach(done => {
            state = {organizations: {ORG_GUID: {}}};
            server = ServerFactory.newServer(state, port, done);
        });
        it('Delete a Particular Organization', done => {
            const method = 'delete';
            const path = '/v2/organizations/ORG_GUID';
            request({method, path})
                .then(assertResponse({}))
                .then(() => {
                    expect(state.organizations.ORG_GUID).toBeFalsy();
                })
                .then(done)
                .catch(caught(done));
        });
    });

});