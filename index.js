'use strict';

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
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('passport');

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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function formatTS(foodList){
    return foodList.map(function(e){
        var newExpDate = formatDate(e.expiration_date);
        e.date_s = newExpDate.toString();
        console.log(e)
        return e;
    })
}

function initialize () {
    let app = express();

    var routes = require('./routes/index');
    var home = require('./routes/home');

    // View Engine
    app.set('views', path.join(__dirname, 'views'));
    app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout'}));
    app.set('view engine', 'hbs');

    // BodyParser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());

    // Set Static Folder
    app.use(express.static('public'));

    // Express Session
    app.use(session({
        secret: 'secret',
        saveUninitialized: true,
        resave: true
    }));

    // Passport init
    app.use(passport.initialize());
    app.use(passport.session());

    // Express Validator
    app.use(expressValidator({
        errorFormatter:(param, msg, value) => {
            var namespace = param.split('.')
                , root    = namespace.shift()
                , formParam = root;

            while(namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param : formParam,
                msg   : msg,
                value : value
            };
        }
    }));

    // Connect Flash
    app.use(flash());

    // Global Vars
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    });

    app.use('/', routes);
    app.use('/home', home);

    app.use((err, req, res, next) => {
        res.status(500).send(err);
    });


    app.get('/items', (req, res) => {
        var food = [];
        Item.find({'offeredBy.id': {$ne: req.user._id}}, function (err, docs) {

            if (err) {
                console.log(err);
            } else {
                var fdocs = formatTS(docs);
                food = {food: fdocs};
            }
            res.render('items', food);
        });
    });

    app.get('/reserve-item/:id', function(req, res) {
      var id = req.params.id;
      var blockedBy = req.user._id;
        Item.update({id: id},{ $set: { 'blockedBy.id': blockedBy, 'blockedBy.name': req.user.first_name}},{multi: false},function (err, docs) {
            if (err) {
                console.log(err);
            }
            res.redirect('/my-items');
        })
    });

        app.get('/add-item', (req, res) => {
            //timebased uuid
            var id = uuid.v1();
            var minRadius = 50;
            var maxRadius = 1000;
            var distance = (Math.random() * (maxRadius - minRadius) + minRadius).toFixed(2);
            res.render('add-item', {user: req.user.first_name, userid: req.user._id, id: id, distance: distance});
        });

        app.post('/item-added', (req, res) => {
            var b = req.body;

            console.log(b);
            var doc = {};
            doc.location = {};
            doc.location.lat = getFromObject(b,'form_response.hidden.lat', 0);
            doc.location.lon = getFromObject(b,'form_response.hidden.lon', 0);
            doc.location.distance = getFromObject(b,'form_response.hidden.distance', 0);
            doc.offeredBy = {};
            doc.offeredBy.name = getFromObject(b,'form_response.hidden.username', 0);
            doc.offeredBy.id = getFromObject(b,'form_response.hidden.userid', 0);
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
            Item.find({'offeredBy.id': req.user._id}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    var fdocs = formatTS(docs);
                    food = {food: fdocs};
                }
                res.render('my-published-items', food);
            })
        });


        app.get('/my-items', (req, res) => {
            var food = [];
            Item.find({'blockedBy.id': req.user._id}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    var fdocs = formatTS(docs);
                    food = fdocs;
                }
                getRecipe(food,res);
            })
        });

        var getRecipe = function(food, res){
            console.log(food);

            if (food.length > 0) {
                var ingredients = food.map((f) => f.name);

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
