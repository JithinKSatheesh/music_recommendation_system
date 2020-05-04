const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    listenHistory: [{ type: mongoose.Schema.Types.ObjectId,ref: "Music" ,unique:false}],
    ratedMusic: [{type: mongoose.Schema.Types.ObjectId, ref:"Rating"}],
    playList:[{type: mongoose.Schema.Types.ObjectId, ref:"Playlist"}]
    
});

userSchema.plugin(passportLocalMongoose);

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);