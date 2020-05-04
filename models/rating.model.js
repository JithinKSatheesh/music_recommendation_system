var mongoose = require('mongoose');

// define the schema for our music model
var ratingSchema = mongoose.Schema({
    userId:String,
    username:String,
    musicId:String,
    title:String,
    rating:Number

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Rating', ratingSchema);