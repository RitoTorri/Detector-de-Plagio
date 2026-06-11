const App = require('./app');
const expressApp = new App();
module.exports = expressApp.app;