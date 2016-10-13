const {Router} = require('express');

const MockCloudController = require('./mock_cloud_controller');

module.exports = {
    newRouter(state = {}) {
        const router = new Router();
        Object.keys(state).forEach(key => {
            router.get(`/${key}`, MockCloudController.getList(state, key));
            router.get(`/${key}/:guid`, MockCloudController.get(state, key));
            router.put(`/${key}/:guid`, MockCloudController.put(state, key));
            router.post(`/${key}`, MockCloudController.post(state, key));
            router.delete(`/${key}/:guid`, MockCloudController.del(state, key));
            const subRoutesForKey = (MockCloudController.subRoutes[key] || [])
                .filter(subKey => ['metadata', 'entity'].indexOf(subKey) === -1);
            subRoutesForKey
                .filter(subKey => subKey.charAt(subKey.length - 1) === 's')
                .forEach(subKey => {
                    router.get(`/${key}/:guid/${subKey}`,
                        MockCloudController.getList(state, key, subKey));
                    router.put(`/${key}/:guid/${subKey}/:subGuid`,
                        MockCloudController.put(state, key, subKey));
                });
            subRoutesForKey
                .filter(subKey => subKey.charAt(subKey.length - 1) !== 's')
                .forEach(subKey => router.get(`/${key}/:guid/${subKey}`,
                    MockCloudController.get(state, key, subKey)));
        });
        MockCloudController.emptyLists.forEach(route => router.get(route,
            MockCloudController.getEmptyList));
        MockCloudController.emptyObjects.forEach(route => router.get(route,
            MockCloudController.getEmptyObject));
        return router;
    }
};