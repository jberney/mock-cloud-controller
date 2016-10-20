const {Router} = require('express');
const uuid = require('node-uuid');

const MockCloudController = require('./mock_cloud_controller');

const DEFAULT_STATE = {
    apps: {},
    developers: {},
    events: {},
    info: {},
    jobs: {},
    managers: {},
    organizations: {},
    private_domains: {
        localhost: {
            metadata: {
                guid: uuid.v4()
            },
            entity: {
                name: 'localhost'
            }
        }
    },
    quota_definitions: {},
    routes: {},
    service_bindings: {},
    service_brokers: {},
    service_instances: {},
    service_plans: {},
    services: {},
    shared_domains: {},
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
    newRouter(state) {
        state = Object.assign({}, DEFAULT_STATE, state);
        const router = new Router();
        router.get('/info', (req, res) => res.json(state.info));
        Object.keys(state).forEach(key => {
            router.get(`/${key}`, MockCloudController.getList(state, key));
            router.get(`/${key}/:guid`, MockCloudController.get(state, key));
            router.put(`/${key}/:guid`, MockCloudController.put(state, key));
            router.post(`/${key}`, MockCloudController.post(state, key));
            router.delete(`/${key}/:guid`, MockCloudController.del(state, key));
            Object.keys(state).forEach(parentKey => {
                router.get(`/${parentKey}/:parentGuid/${key}`,
                    MockCloudController.getList(state, key, parentKey));
                router.put(`/${parentKey}/:parentGuid/${key}`,
                    MockCloudController.put(state, key, parentKey));
                router.put(`/${parentKey}/:parentGuid/${key}/:guid`,
                    MockCloudController.put(state, key, parentKey));
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
        // TODO error handling
        // router.use((req, res) => {
        //     console.log('Unknown route:', req.url);
        //     res.status(404).json({});
        // });
        return router;
    }
};