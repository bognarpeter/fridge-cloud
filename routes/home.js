'use strict';

const router = require('express').Router();
const util = require('../util');
const Item = require('../models/item-model');

//Get Homepage
router.get('/', util.authMw, function(req, res) {
        res.render('home', {user: req.user});
})
module.exports = router;
