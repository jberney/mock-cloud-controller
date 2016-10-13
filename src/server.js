const AppFactory = require('./app_factory');

const PORT = process.env.PORT || 9000;

module.exports = AppFactory.newApp().listen(PORT, function () {
    console.log(`Mock Cloud Controller listening on port ${PORT}`);
});