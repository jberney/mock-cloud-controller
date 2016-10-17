const {Router} = require('express');

const MockCloudController = require('./mock_cloud_controller');

module.exports = {
    newRouter(state = {}) {
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
        router.put(`/resource_match`, (req, res) => console.log(req.body) || res.json(req.body));
        return router;
    }
};