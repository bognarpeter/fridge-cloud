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
        name: { type: String },
        id: { type: String },
    },
    offeredBy: {
        name: { type: String },
        id: { type: String },
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
    date_s: {
        type: String
    },
    image: {
        type: String
    },
    location: {
        lon: { type: Number },
        lat: { type: Number },
        distance: { type: Number }
    }
});

const Item = module.exports = mongoose.model('Item', ItemSchema);

var createItem = function(newItem, callback){
    newItem.image = "igen";
    newItem.save(callback);

};

var getItemsByBlocker = function(username, callback){
    Item.find({blockedBy: username}, callback);
};

var getItemsByOffer = function(username, callback){
    Item.find({offeredBy: username}, callback);
};

module.exports.createItem = createItem;
module.exports.getItemsByBlocker = getItemsByBlocker;
module.exports.getItemsByOffer = getItemsByOffer;