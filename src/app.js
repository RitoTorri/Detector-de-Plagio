// Importación de dependencias
const express = require('express');
const path = require('path');
const cors = require('cors');
//const rateLimit = require('express-rate-limit');

// Importación de rutas
const compare = require('./router/compare.route');

// Clase App
class App {
    // Atributos
    app;
    //port;

    // Rate limir
    //rateLimit;
    //rateLimitWindow;

    // Inicializacion de atributos
    constructor() {
        this.app = express();
        //this.port = process.env.PORT || 3000;
        // this.rateLimit = process.env.API_RATE_LIMIT || 100;
        // this.rateLimitWindow = process.env.API_RATE_LIMIT_WINDOW || 15 * 60 * 1000;
        this.middlewares();
        this.routes();
    }

    middlewares = () => {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(cors());
        /*this.app.use(rateLimit({
            windowMs: parseInt(this.rateLimitWindow), // 15 minutes
            max: parseInt(this.rateLimit), // Limit each IP to 100 requests per `window` (here, per 15 minutes)
            message: 'Too many requests from this IP, please try again in 15 minutes'
        }));*/
    }

    routes = () => {
        this.app.use('/', compare);
    }

    /*
    start = () => {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server started on http://localhost:${this.port}`);
        });
    }*/
}

module.exports = App;