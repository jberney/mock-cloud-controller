describe('AppFactory', () => {

    let AppFactory, ExpressProvider, app, bodyParser, jsonMiddleware, RouterFactory, router;
    beforeEach(() => {
        AppFactory = require('../src/app_factory');
        app = jasmine.createSpyObj('app', ['use']);
        ExpressProvider = require('../src/express_provider');
        bodyParser = require('body-parser');
        // jsonMiddleware = jasmine.createSpy('jsonMiddleware');
        // spyOn(bodyParser, 'json').and.returnValue(jsonMiddleware);
        spyOn(ExpressProvider, 'get').and.returnValue(app);
        RouterFactory = require('../src/router_factory');
        router = jasmine.createSpy();
        spyOn(RouterFactory, 'newRouter').and.returnValue(router);
    });

    it('returns app', () => {
        const state = {};
        expect(AppFactory.newApp(state)).toBe(app);
        expect(ExpressProvider.get).toHaveBeenCalledWith();
        // expect(bodyParser.json).toHaveBeenCalledWith();
        // expect(app.use).toHaveBeenCalledWith(jsonMiddleware);
        expect(RouterFactory.newRouter).toHaveBeenCalledWith(state);
        expect(app.use).toHaveBeenCalledWith('/v2', router);
    });

});