'use strict';

const url = require("url");
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const typeformEmbed = require('@typeform/embed')
var rp = require('request-promise');

//constants
const PORT = 8080;
const EDAMAM_APP_ID = "e05818ac";
const EDAMAM_APP_KEY = "e5b249a2f296b9180130b68f31072ce6";
const DEFAULT_IMG_URL = "https://cookieandkate.com/images/2018/05/traditional-stovetop-frittata-recipe-4.jpg";

const RECIPE_LIMIT = 1;

var logger = function(status, msg){
    var dt = new Date();
    console.log('['+dt+']['+status+'] '+msg);
}

function getFromObject(obj, path, def) {
    var parts = path.split('.');

    for (var p in parts) {
        if (typeof obj[parts[p]] !== 'undefined') {
            obj = obj[parts[p]];
        } else {
            return def;
        }
    }

    return obj;
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

    app.get('/', (req, res) => {
        var person = "Gaudi";
        res.render('index', {person: person});
    });

    app.get('/items', (req, res) => {
        var person = "Gaudi";
        res.render('items', {food: [
          {
            "id": 0,
            "name": "apple",
            "type": "vegetable",
            "blockedBy": "Peter",
            "offeredBy": "Simon",
            "amount": 0,
            "unit": "Pieces",
            "expiration_date": "2019-10-12T03:15:01.588Z",
            "image": "https://google.de/image.jpg",
            "location": {
              "lon": 0,
              "lat": 0
            }
          }
        ]});
      });

    app.use('/add-item', (req, res) => {
        var person = "Gaudi";
        res.render('add-item', {person: person});
    });

    app.get('/my-items', (req, res) => {
        var person = "Gaudi";
        res.render('my-items', {food: [
          {
            "id": 0,
            "name": "apple",
            "type": "vegetable",
            "blockedBy": "Peter",
            "offeredBy": "Simon",
            "amount": 0,
            "unit": "Pieces",
            "expiration_date": "2019-10-12T03:15:01.588Z",
            "image": "https://google.de/image.jpg",
            "location": {
              "lon": 0,
              "lat": 0
            }
          }
        ]});
    });
    //Frontend Routes
    require('./routes/frontend')(app);

    app.get('/getrecipe', (req, res) => {

        var ingredients = req.query.food_list;
        if(ingredients == 'undefined') {

            var options = {
                method: 'GET',
                uri: 'https://api.edamam.com/search',
                headers: {
                    "Content-Type": 'application/json'
                },
                qs: {
                    app_id: EDAMAM_APP_ID,
                    app_key: EDAMAM_APP_KEY,
                    q: ingredients.join(','),
                    to: RECIPE_LIMIT
                },
                json: true
            };

            rp(options)
                .then(function (apiResponse) {

                    var recipeRaw = apiResponse.hits[0];
                    if (recipeRaw != 'undefined') {
                        //parse recipe
                        var recipeResult = {};
                        recipeResult.name = getFromObject(recipeRaw, 'recipe.label', 'no recipe name');
                        recipeResult.image = getFromObject(recipeRaw, 'recipe.image', DEFAULT_IMG_URL);
                        recipeResult.calories = Math.round(getFromObject(recipeRaw, 'recipe.calories', 0));
                        recipeResult.time = getFromObject(recipeRaw, 'recipe.totalTime', 60);
                        recipeResult.ingredients = getFromObject(recipeRaw, 'recipe.ingredientLines', ['salt', 'love']);
                        recipeResult.diets = getFromObject(recipeRaw, 'recipe.dietLabels', ['low-carb']);
                        recipeResult.source = getFromObject(recipeRaw, 'recipe.source', 'Recipe DB');

                        console.log(recipeResult);
                        res.render('items', {recipe: recipeResult});
                    }
                })
                .catch((err) => console.log(err));
        }

    });

    app.listen(PORT, (err) => {
        if(err){
            console.log(`Fail: ${err}`);
        }
        console.log(`Server is running.\nListening on port ${PORT}...`);
    });
};

initialize();
