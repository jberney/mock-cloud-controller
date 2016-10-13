const values = require('object.values');

describe('MockCloudController', () => {
    let MockCloudController, response;
    beforeEach(() => {
        MockCloudController = require('../src/mock_cloud_controller');
        response = jasmine.createSpyObj('response', ['setHeader', 'send']);
    });

    describe('#getEmptyList', () => {
        it('should respond with empty list', () => {
            MockCloudController.getEmptyList(null, response);
            expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(response.send).toHaveBeenCalledWith(JSON.stringify({
                total_results: 0,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources: []
            }));
        });
    });

    describe('#getEmptyObject', () => {
        it('should respond with empty object', () => {
            MockCloudController.getEmptyObject(null, response);
            expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(response.send).toHaveBeenCalledWith(JSON.stringify({}));
        });
    });

    describe('#getList', () => {
        it('should response with list with key', () => {
            const state = {
                KEY: {
                    GUID_1: {
                        metadata: {
                            guid: 'GUID_1',
                        },
                        entity: {
                            a: 1
                        }
                    },
                    GUID_2: {
                        metadata: {
                            guid: 'GUID_2',
                        },
                        entity: {
                            a: 2
                        }
                    }
                }
            };
            MockCloudController.getList(state, 'KEY')(null, response);
            expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(response.send).toHaveBeenCalledWith(JSON.stringify({
                total_results: 2,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources: [{
                    metadata: {
                        guid: 'GUID_1',
                    },
                    entity: {
                        a: 1
                    }
                }, {
                    metadata: {
                        guid: 'GUID_2',
                    },
                    entity: {
                        a: 2
                    }
                }]
            }));
        });

        it('should response with list with key and subkey', () => {
            const state = {
                KEY: {
                    KEY_GUID: {
                        SUBKEY: {
                            SUBKEY_GUID_1: {
                                metadata: {
                                    guid: 'SUBKEY_GUID_1'
                                },
                                entity: {
                                    a: 1
                                }
                            },
                            SUBKEY_GUID_2: {
                                metadata: {
                                    guid: 'SUBKEY_GUID_2'
                                },
                                entity: {
                                    a: 2
                                }
                            }
                        }
                    }
                }
            };
            const request = {params: {guid: 'KEY_GUID'}};
            MockCloudController.getList(state, 'KEY', 'SUBKEY')(request, response);
            expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(response.send).toHaveBeenCalledWith(JSON.stringify({
                total_results: 2,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources: [{
                    metadata: {
                        guid: 'SUBKEY_GUID_1'
                    },
                    entity: {
                        a: 1
                    }
                }, {
                    metadata: {
                        guid: 'SUBKEY_GUID_2'
                    },
                    entity: {
                        a: 2
                    }
                }]
            }));
        });
    });
});