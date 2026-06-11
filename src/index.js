const App = require('./app');

const expressApp = new App().app;
module.exports = expressApp;

// new App().start();
