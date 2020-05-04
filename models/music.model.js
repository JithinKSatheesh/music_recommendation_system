var mongoose = require('mongoose');

// define the schema for our music model
var musicSchema = mongoose.Schema({
    songId:String,
    title: String,
    artist: String,
    genre: {type: String, default: "music"},

    danceability:{type:Number, default: 0},
    energy:{type:Number, default: 0},
    loudness:{type:Number, default: 0},
    tempo:{type:Number, default: 0},
    speechiness:{type:Number, default: 0},
    acousticness:{type:Number, default: 0},
    liveness:{type:Number, default: 0},
    valence:{type:Number, default: 0},

    listenCount: {type:Number, default: 0},
    rating: {type:Number, default: 0},
    ratingRef:[{type: mongoose.Schema.Types.ObjectId, ref:"Rating"}],
    imageUrl:{type:String, default: "sample_image.jpg"},
    fileUrl:{type:String, default: "sample_song.mp3"}
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Music', musicSchema);