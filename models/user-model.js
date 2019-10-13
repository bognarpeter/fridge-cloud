'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSaltRounds = 15;

const UserSchema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    hash: {
        type: String
    }
});

const User = mongoose.model('user', UserSchema);

var createUser = function(newUser, callback){
    newUser.hash = "hash";
    newUser.save(callback);
};

var getUserByEmail = function(email, callback){
    var query = {email: email};
    User.findOne(query, callback);
};

var getUserById = function(id, callback){
    User.findById(id, callback);
};

var comparePassword = function(candidatePassword, hash, callback){
    if(candidatePassword == hash){
        callback(null, true);
    }else{
        console.log("problem with passwords");
    }
};

module.exports = User;
module.exports.createUser = createUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getUserById = getUserById;
module.exports.comparePassword = comparePassword;