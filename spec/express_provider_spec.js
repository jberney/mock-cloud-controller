describe('ExpressProvider', () => {

    let ExpressProvider;
    beforeEach(() => {
        ExpressProvider = require('../src/express_provider');
    });

    it('returns express instance', () => {
        const app = ExpressProvider.get();
        expect(app.listen).toEqual(jasmine.any(Function));
        expect(app.use).toEqual(jasmine.any(Function));
    });

});