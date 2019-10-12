'use strict';

var mongoose = require('mongoose');
var ItemSchema = mongoose.Schema({
    id: {
    	type: String
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    blockedBy: {
        type: String
    },
    offeredBy: {
        type: String
    },
    amount: {
        type: Number
    },
    unit: {
        type: String
    },
    expiration_date: {
        type: Date
    },
    image: {
        type: String
    },
    location: {
        lon: { type: Number },
        lat: { type: Number }
    }
});

const Item = module.exports = mongoose.model('Item', ItemSchema);

var getItemsByBlocker = function(username, callback){
    Item.find({blockedBy: username}, callback);
};

var getItemsByOffer = function(username, callback){
    Item.find({offeredBy: username}, callback);
};

module.exports.createItem = createItem;
module.exports.getItemsByBlocker = getItemsByBlocker;
module.exports.getItemsByOffer = getItemsByOffer;