'use strict';

const url = require("url");
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
var rp = require('request-promise');

const PORT = 8080

var logger = function(status, msg){
    var dt = new Date();
    console.log('['+dt+']['+status+'] '+msg);
}

function initialize () {
    let app = express();

    // View Engine
    app.set('views', path.join(__dirname, 'views'));
    app.engine('hbs', hbs({extname:'hbs', defaultLayout:'layout'}));
    app.set('view engine', 'hbs');

    // BodyParser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Set Static Folder
    app.use(express.static('public'));

    // Express Session
    app.use(session({
        secret: 'secret',
        saveUninitialized: true,
        resave: true
    }));

    // Connect Flash
    app.use(flash());

    // Global Vars
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        next();
    });

    app.use((err, req, res, next) => {
        res.status(500).send(err);
    });

    //Frontend Routes
    require('./routes/frontend')(app);

    app.listen(PORT, (err) => {
        if(err){
            console.log(`Fail: ${err}`);
        }
        console.log(`Server is running.\nListening on port ${PORT}...`);
    });
};

initialize();
