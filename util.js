'use strict';

//authentication middleware
var authMw = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg','You are not logged in');
        res.redirect('/');
    }
};

// datetime, status, message
var log = function(status, msg){
    var dt = new Date();
    console.log('['+dt+']['+status+'] '+msg);
}

module.exports.authMw = authMw;
module.exports.log = log;

//STATUSES
module.exports.ERROR = "ERROR";