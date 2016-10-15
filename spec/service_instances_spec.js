const uuid = require('node-uuid');
const values = require('object.values');

const {assertCatch, assertResponse, caught, request} = require('./spec_helper');

describe('Service Instances API', () => {

    const port = 9000;

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

    describe('GET /v2/service_instances/:guid', () => {
        beforeEach(done => {
            state = {
                service_instances: {
                    SERVICE_INSTANCE_GUID: {
                        metadata: {
                            guid: 'SERVICE_INSTANCE_GUID'
                        },
                        entity: {
                            name: 'NAME'
                        }
                    }
                }
            };
            server = ServerFactory.newServer(state, port, done);
        });
        it('Retrieve a Particular Service Instance', done => {
            const method = 'get';
            const path = '/v2/service_instances/SERVICE_INSTANCE_GUID';
            request({method, path})
                .then(assertResponse(state.service_instances.SERVICE_INSTANCE_GUID))
                .then(done)
                .catch(caught(done));
        });
    });

    describe('POST /v2/service_instances', () => {
        describe('Create a Service Instance', () => {
            describe('with a unique name', () => {
                beforeEach(done => {
                    state = {service_instances: {}};
                    server = ServerFactory.newServer(state, port, done);
                });
                it('succeeds', done => {
                    const method = 'post';
                    const path = '/v2/service_instances';
                    const entity = {
                        name: 'NAME',
                        route_group_guid: 'ROUTE_GROUP_GUID'
                    };
                    const expected = {
                        metadata: {
                            guid: 'GUID',
                            url: '/v2/service_instances/GUID',
                            created_at: new Date(now).toISOString(),
                            updated_at: new Date(now).toISOString()
                        },
                        entity
                    };
                    request({method, path, body: entity})
                        .then(assertResponse(expected))
                        .then(() => {
                            expect(state.service_instances.GUID).toEqual(expected);
                        })
                        .then(done)
                        .catch(caught(done));
                });
            });

            describe('with a duplicate name', () => {
                describe('in the same table', () => {
                    beforeEach(done => {
                        state = {
                            service_instances: {
                                OLD_SERVICE_INSTANCE_GUID: {
                                    metadata: {
                                        guid: 'OLD_SERVICE_INSTANCE_GUID'
                                    },
                                    entity: {
                                        name: 'NAME'
                                    }
                                }
                            }
                        };
                        server = ServerFactory.newServer(state, port, done);
                    });
                    it('fails', done => {
                        const method = 'post';
                        const path = '/v2/service_instances';
                        const entity = {
                            name: 'NAME',
                            route_group_guid: 'ROUTE_GROUP_GUID'
                        };
                        const error = {
                            description: 'The service instance name is taken: NAME'
                        };
                        request({method, path, body: entity})
                            .then(assertCatch(error, done))
                            .catch(assertCatch(error, done));
                    });
                });
                describe('in a related table', () => {
                    beforeEach(done => {
                        state = {
                            service_instances: {},
                            user_provided_service_instances: {
                                USER_PROVIDED_SERVICE_INSTANCE_GUID: {
                                    metadata: {
                                        guid: 'USER_PROVIDED_SERVICE_INSTANCE_GUID'
                                    },
                                    entity: {
                                        name: 'NAME'
                                    }
                                }
                            }
                        };
                        server = ServerFactory.newServer(state, port, done);
                    });
                    it('fails', done => {
                        const method = 'post';
                        const path = '/v2/service_instances';
                        const entity = {
                            name: 'NAME',
                            route_group_guid: 'ROUTE_GROUP_GUID'
                        };
                        const error = {
                            description: 'The service instance name is taken: NAME'
                        };
                        request({method, path, body: entity})
                            .then(assertCatch(error, done))
                            .catch(assertCatch(error, done));
                    });
                });
            });
        });
    });

    describe('PUT /v2/service_instances/:guid', () => {
        beforeEach(done => {
            state = {
                service_instances: {
                    SERVICE_INSTANCE_GUID: {
                        metadata: {
                            guid: 'SERVICE_INSTANCE_GUID',
                            url: `/v2/service_instances/SERVICE_INSTANCE_GUID`,
                            created_at: 'PAST',
                            updated_at: 'PAST'
                        },
                        entity: {
                            name: 'NAME',
                            route_group_guid: 'ROUTE_GROUP_GUID'
                        }
                    },
                    ANOTHER_SERVICE_INSTANCE_GUID: {
                        metadata: {
                            guid: 'ANOTHER_SERVICE_INSTANCE_GUID',
                            url: `/v2/service_instances/ANOTHER_SERVICE_INSTANCE_GUID`,
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
            server = ServerFactory.newServer(state, port, done);
        });
        it('Update a Service Instance with a unique name succeeds', done => {
            const method = 'put';
            const path = '/v2/service_instances/SERVICE_INSTANCE_GUID';
            const entity = {
                name: 'NEW_NAME',
                route_group_guid: 'NEW_ROUTE_GROUP_GUID'
            };
            const expected = {
                metadata: {
                    guid: 'SERVICE_INSTANCE_GUID',
                    url: '/v2/service_instances/SERVICE_INSTANCE_GUID',
                    created_at: 'PAST',
                    updated_at: new Date(now).toISOString()
                },
                entity
            };
            request({method, path, body: entity})
                .then(assertResponse(expected))
                .then(() => {
                    expect(state.service_instances.SERVICE_INSTANCE_GUID).toEqual(expected);
                })
                .then(done)
                .catch(caught(done));
        });
        it('Update a Service Instance with a duplicate name fails', done => {
            const method = 'put';
            const path = '/v2/service_instances/SERVICE_INSTANCE_GUID';
            const entity = {
                name: 'ANOTHER_NAME',
                route_group_guid: 'NEW_ROUTE_GROUP_GUID'
            };
            const error = {
                description: 'The service instance name is taken: ANOTHER_NAME'
            };
            request({method, path, body: entity})
                .then(assertCatch(error, done))
                .catch(assertCatch(error, done));
        });
    });

    describe('DELETE /v2/service_instances/:guid', () => {
        beforeEach(done => {
            state = {service_instances: {SERVICE_INSTANCE_GUID: {}}};
            server = ServerFactory.newServer(state, port, done);
        });
        it('Delete a Particular Service Instance', done => {
            const method = 'delete';
            const path = '/v2/service_instances/SERVICE_INSTANCE_GUID';
            request({method, path})
                .then(assertResponse({}))
                .then(() => {
                    expect(state.service_instances.SERVICE_INSTANCE_GUID).toBeFalsy();
                })
                .then(done)
                .catch(caught(done));
        });
    });

    describe('GET /v2/service_instances', () => {
        beforeEach(done => {
            state = {
                service_instances: {
                    SERVICE_INSTANCE_GUID: {
                        metadata: {
                            guid: 'SERVICE_INSTANCE_GUID'
                        },
                        entity: {
                            name: 'NAME'
                        }
                    }
                }
            };
            server = ServerFactory.newServer(state, port, done);
        });
        it('List all Service Instances', done => {
            const method = 'get';
            const path = '/v2/service_instances';
            request({method, path})
                .then(assertResponse({
                    total_results: 1,
                    total_pages: 1,
                    prev_url: null,
                    next_url: null,
                    resources: values(state.service_instances)
                }))
                .then(done)
                .catch(caught(done));
        });
    });

});