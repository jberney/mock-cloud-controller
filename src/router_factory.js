const {Router} = require('express');
const uuid = require('node-uuid');

const MockCloudController = require('./mock_cloud_controller');

const DOMAIN_GUID = uuid.v4();

const DEFAULT_STATE = {
    apps: {},
    developers: {},
    events: {},
    info: {},
    jobs: {},
    managers: {},
    organizations: {},
    private_domains: {},
    quota_definitions: {},
    routes: {},
    service_bindings: {},
    service_brokers: {},
    service_instances: {},
    service_plans: {},
    services: {},
    shared_domains: {
        [DOMAIN_GUID]: {
            metadata: {
                guid: DOMAIN_GUID
            },
            entity: {
                name: 'localhost'
            }
        }
    },
    spaces: {},
    stacks: {
        STACK_GUID: {
            metadata: {
                guid: 'STACK_GUID'
            },
            entity: {
                name: 'FAKE STACK'
            }
        }
    },
    user_provided_service_instances: {},
    user_roles: {},
    users: {}
};

module.exports = {
    newRouter({state, logs = {}}) {
        state = Object.assign({}, DEFAULT_STATE, state);
        const router = new Router();
        router.get('/info', (req, res) => res.json(state.info));
        const keys = Object.keys(state);
        state.associations = {};
        keys.forEach(key => {
            state.associations[key] = {};
            router.get(`/${key}`, MockCloudController.getList(state, key));
            router.get(`/${key}/:guid`, MockCloudController.get(state, key));
            router.put(`/${key}/:guid`, MockCloudController.put(state, logs, key));
            router.post(`/${key}`, MockCloudController.post(state, logs, key));
            router.delete(`/${key}/:guid`, MockCloudController.del(state, key));
            keys.forEach(parentKey => {
                router.get(`/${parentKey}/:parentGuid/${key}`,
                    MockCloudController.getList(state, key, parentKey));
                router.put(`/${parentKey}/:parentGuid/${key}`,
                    MockCloudController.put(state, logs, key, parentKey));
                router.put(`/${parentKey}/:parentGuid/${key}/:guid`,
                    MockCloudController.put(state, logs, key, parentKey));
            });
        });
        router.put('/resource_match', MockCloudController.putBody);
        router.put('/apps/:guid/bits', MockCloudController.putBody);
        router.get('/apps/:guid/env', MockCloudController.getEmpty);
        router.get('/apps/:guid/instances', MockCloudController.getStateful);
        router.get('/apps/:guid/stats', MockCloudController.getStateful);
        router.get('/apps/:guid/summary', MockCloudController.get(state, 'apps'));
        router.get('/organizations/:guid/memory_usage', MockCloudController.getEmpty);
        router.get('/config/feature_flags/:feature', MockCloudController.getEmpty);
        return router;
    }
};