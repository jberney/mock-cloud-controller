describe('Server', () => {

    let app;
    beforeEach(() => {
        app = jasmine.createSpyObj('app', ['listen']);
        app.listen.and.callFake((port, callback) => callback());
        const AppFactory = require('../src/app_factory');
        spyOn(AppFactory, 'newApp').and.callFake(() => app);
        spyOn(console, 'log');
        require('../src/server');
    });

    it('should listen on port 9000 by default', () => {
        expect(app.listen).toHaveBeenCalledWith(9000, jasmine.any(Function));
        expect(console.log).toHaveBeenCalledWith('Mock Cloud Controller listening on port 9000');
    });

});