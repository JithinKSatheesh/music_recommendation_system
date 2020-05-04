var mongoose = require('mongoose');

// define the schema for our music model
var playlistSchema = mongoose.Schema({
    username:String,
    songs:[{type: mongoose.Schema.Types.ObjectId, ref:"Music"}]

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Playlist', playlistSchema);