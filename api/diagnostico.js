module.exports = (req, res) => {
    try {
        const App = require('../src/app');
        const appInstance = new App();
        res.status(200).json({ message: "La clase App se instanció correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al instanciar App",
            error: error.message,
            stack: error.stack
        });
    }
};