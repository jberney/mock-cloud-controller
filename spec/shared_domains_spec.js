const uuid = require('node-uuid');
const values = require('object.values');

const {assertCatch, assertResponse, caught, request} = require('./spec_helper');

describe('Shared Domains API', () => {

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

    describe('GET /v2/shared_domains/:guid', () => {
        beforeEach(done => {
            state = {
                shared_domains: {
                    SHARED_DOMAIN_GUID: {
                        metadata: {
                            guid: 'SHARED_DOMAIN_GUID'
                        },
                        entity: {
                            name: 'NAME'
                        }
                    }
                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Retrieve a Particular Shared Domain', done => {
            const method = 'get';
            const path = '/v2/shared_domains/SHARED_DOMAIN_GUID';
            request({method, port, path})
                .then(assertResponse(state.shared_domains.SHARED_DOMAIN_GUID))
                .then(done)
                .catch(caught(done));
        });
    });

    describe('POST /v2/shared_domains', () => {
        describe('Create a Shared Domain', () => {
            describe('with a unique name', () => {
                beforeEach(done => {
                    state = {shared_domains: {}};
                    server = ServerFactory.newServer({state, port}, done);
                });
                it('succeeds', done => {
                    const method = 'post';
                    const path = '/v2/shared_domains';
                    const entity = {
                        name: 'NAME',
                        route_group_guid: 'ROUTE_GROUP_GUID'
                    };
                    const expected = {
                        metadata: {
                            guid: 'GUID',
                            url: '/v2/shared_domains/GUID',
                            created_at: new Date(now).toISOString(),
                            updated_at: new Date(now).toISOString()
                        },
                        entity
                    };
                    request({method, port, path, body: entity})
                        .then(assertResponse(expected))
                        .then(() => {
                            expect(state.shared_domains.GUID).toEqual(expected);
                        })
                        .then(done)
                        .catch(caught(done));
                });
            });

            describe('with a duplicate name', () => {
                beforeEach(done => {
                    state = {
                        shared_domains: {
                            OLD_SHARED_DOMAIN_GUID: {
                                metadata: {
                                    guid: 'OLD_SHARED_DOMAIN_GUID'
                                },
                                entity: {
                                    name: 'NAME'
                                }
                            }
                        }
                    };
                    server = ServerFactory.newServer({state, port}, done);
                });
                it('fails', done => {
                    const method = 'post';
                    const path = '/v2/shared_domains';
                    const entity = {
                        name: 'NAME',
                        route_group_guid: 'ROUTE_GROUP_GUID'
                    };
                    const error = {
                        description: 'The domain name is taken: NAME'
                    };
                    request({method, port, path, body: entity})
                        .then(assertCatch(error, done))
                        .catch(assertCatch(error, done));
                });
            });
        });
    });

    describe('PUT /v2/shared_domains/:guid', () => {
        beforeEach(done => {
            state = {
                shared_domains: {
                    SHARED_DOMAIN_GUID: {
                        metadata: {
                            guid: 'SHARED_DOMAIN_GUID',
                            url: `/v2/shared_domains/SHARED_DOMAIN_GUID`,
                            created_at: 'PAST',
                            updated_at: 'PAST'
                        },
                        entity: {
                            name: 'NAME',
                            route_group_guid: 'ROUTE_GROUP_GUID'
                        }
                    },
                    ANOTHER_SHARED_DOMAIN_GUID: {
                        metadata: {
                            guid: 'ANOTHER_SHARED_DOMAIN_GUID',
                            url: `/v2/shared_domains/ANOTHER_SHARED_DOMAIN_GUID`,
                            created_at: 'PAST',
                            updated_at: 'PAST'
                        },
                        entity: {
                            name: 'ANOTHER_NAME',
                            route_group_guid: 'ANOTHER_ROUTE_GROUP_GUID'
                        }
                    }
                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Update a Shared Domain with a unique name succeeds', done => {
            const method = 'put';
            const path = '/v2/shared_domains/SHARED_DOMAIN_GUID';
            const entity = {
                name: 'NEW_NAME',
                route_group_guid: 'NEW_ROUTE_GROUP_GUID'
            };
            const expected = {
                metadata: {
                    guid: 'SHARED_DOMAIN_GUID',
                    url: '/v2/shared_domains/SHARED_DOMAIN_GUID',
                    created_at: 'PAST',
                    updated_at: new Date(now).toISOString()
                },
                entity
            };
            request({method, port, path, body: entity})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.shared_domains.SHARED_DOMAIN_GUID).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
        it('Update a Shared Domain with a duplicate name fails', done => {
            const method = 'put';
            const path = '/v2/shared_domains/SHARED_DOMAIN_GUID';
            const entity = {
                name: 'ANOTHER_NAME',
                route_group_guid: 'NEW_ROUTE_GROUP_GUID'
            };
            const error = {
                description: 'The domain name is taken: ANOTHER_NAME'
            };
            request({method, port, path, body: entity})
                .then(assertCatch(error, done))
                .catch(assertCatch(error, done));
        });
    });

    describe('DELETE /v2/shared_domains/:guid', () => {
        beforeEach(done => {
            state = {shared_domains: {SHARED_DOMAIN_GUID: {}}};
            server = ServerFactory.newServer({state, port}, done);
        });
        it('Delete a Particular Shared Domain', done => {
            const method = 'delete';
            const path = '/v2/shared_domains/SHARED_DOMAIN_GUID';
            request({method, port, path})
                .then(assertResponse({}))
                .then(() => {
                    expect(state.shared_domains.SHARED_DOMAIN_GUID).toBeFalsy();
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('GET /v2/shared_domains', () => {
        beforeEach(done => {
            state = {
                shared_domains: {
                    SHARED_DOMAIN_GUID: {
                        metadata: {
                            guid: 'SHARED_DOMAIN_GUID'
                        },
                        entity: {
                            name: 'NAME'
                        }
                    }
                }
            };
            server = ServerFactory.newServer({state, port}, done);
        });
        it('List all Shared Domains', done => {
            const method = 'get';
            const path = '/v2/shared_domains';
            request({method, port, path})
                .then(assertResponse({
                    total_results: 1,
                    total_pages: 1,
                    prev_url: null,
                    next_url: null,
                    resources: values(state.shared_domains)
                }))
                .then(done)
                .catch(caught(done));
        });
    });

});