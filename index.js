'use strict';

const url = require("url");
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const typeformEmbed = require('@typeform/embed')
const rp = require('request-promise');
const mongoose = require('mongoose');
const uuid = require('uuid');

var Item = require('./models/item-model');

//constants
const DB_NAME='main';
const DB_URL = "mongodb+srv://admin:gaudi@fridgecloud-mqpfk.mongodb.net/"
mongoose.connect(DB_URL+DB_NAME,
    {useNewUrlParser: true,
    useUnifiedTopology: true});
const db = mongoose.connection;

const PORT = 8080;
const EDAMAM_APP_ID = "e05818ac";
const EDAMAM_APP_KEY = "e5b249a2f296b9180130b68f31072ce6";
const DEFAULT_IMG_URL = "https://cookieandkate.com/images/2018/05/traditional-stovetop-frittata-recipe-4.jpg";

const RECIPE_LIMIT = 1;
var USER_NAME = 'Joey';

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
    app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout'}));
    app.set('view engine', 'hbs');

    // BodyParser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

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
        if (req.query.username != undefined) {
            USER_NAME = req.query.username;
        }
        res.render('index', {username: USER_NAME});
    });

    app.get('/items', (req, res) => {
        var food = [];
        Item.find({offeredBy: {$ne: USER_NAME}}, function (err, docs) {

            if (err) {
                console.log(err);
            } else {
                food = {food: docs}
            }
            res.render('items', food);
        });
    });

    app.get('/reserve-item/:id', function(req, res) {
      var id = req.params.id;
      //change blockedBy to the username
      
    });

        app.get('/add-item', (req, res) => {
            //timebased uuid
            var id = uuid.v1();
            var minRadius = 50;
            var maxRadius = 1000;
            var distance = (Math.random() * (maxRadius - minRadius) + minRadius).toFixed(2);
            res.render('add-item', {user: USER_NAME, id: id, distance: distance});
        });

        app.post('/item-added', (req, res) => {
            var b = req.body;

            console.log(b);
            var doc = {};
            doc.location = {};
            doc.location.lat = getFromObject(b,'form_response.hidden.lat', 0);
            doc.location.lon = getFromObject(b,'form_response.hidden.lon', 0);
            doc.location.distance = getFromObject(b,'form_response.hidden.distance', 0);
            doc.offeredBy = getFromObject(b,'form_response.hidden.username', 'Joey');
            doc.id = getFromObject(b,'form_response.hidden.uuid', 0);

            b.form_response.answers.map(function(f){
                if(f.field.ref == 'food-name'){
                    doc.name = f.text;
                }else if(f.field.ref == 'amount'){
                    doc.amount = f.text;
                }else if(f.field.ref == 'unit'){
                    doc.unit = f.text;
                }else if(f.field.ref == 'type'){
                    doc.type = f.choice.label;
                }else if(f.field.ref == 'expiration-date'){
                    doc.expiration_date = f.date;
                }
            });
            var instance = new Item(doc);

            Item.createItem(instance,function (err, res) {
                if (err) return console.error(err);
                console.log(res.name + " product successful save to  collection.");
            });
        });


        app.get('/my-published-items', (req, res) => {
            var food = [];
            Item.find({offeredBy: USER_NAME}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    food = {food: docs}
                }
                res.render('my-published-items', food);
            })
        });


        app.get('/my-items', (req, res) => {
            var food = [];
            Item.find({blockedBy: USER_NAME}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    food = docs
                }
                getRecipe(food,res);
            })
        });

        var getRecipe = function(food, res){
            if (food.length > 0) {

                var options = {
                    method: 'GET',
                    uri: 'https://api.edamam.com/search',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    qs: {
                        app_id: EDAMAM_APP_ID,
                        app_key: EDAMAM_APP_KEY,
                        q: food.join(','),
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
                            recipeResult.diet = getFromObject(recipeRaw, 'recipe.dietLabels', ['low-carb'])[0];
                            recipeResult.source = getFromObject(recipeRaw, 'recipe.source', 'Recipe DB');

                            console.log(recipeResult);
                            res.render('my-items', {recipeResult: recipeResult, food: food});
                        }
                    })
                    .catch((err) => console.log(err));
            } else{
                res.render('my-items');
            }

        };

        app.listen(PORT, (err) => {
            if (err) {
                console.log(`Fail: ${err}`);
            }
            console.log(`Server is running.\nListening on port ${PORT}...`);
        });
}
initialize();
