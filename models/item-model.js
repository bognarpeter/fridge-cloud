'use strict';

var mongoose = require('mongoose');

var ItemSchema = mongoose.Schema({
    user_id: {
    	type: String
    },
    name: {
        type: String
    }
});

const Item = module.exports = mongoose.model('Item', ItemSchema);

var createItem = function(newItem, callback){
    newItem.name = "valami";
    newItem.save(callback);
};

var getItemsByRequestId = function(request_id, callback){
    // want to have multiple not just one
    Item.find({user_id}, callback);
};

module.exports.createItem = createItem;
module.exports.getItemsByRequestId = getItemsByRequestId;