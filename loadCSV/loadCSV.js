const mongoose = require("mongoose");

// connect mongoose
mongoose.connect("mongodb://localhost/musicApp",{ useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB."))
    .catch(err => console.error("Could not connect to MongoDB."));



const Music = require("../models/music.model");
const fs = require("fs")
var data = JSON.parse(fs.readFileSync("music2018.json"))


Music.insertMany(data, function (err, docs) {
      if (err){ 
          return console.error(err);
      } else {
        console.log("Multiple documents inserted to Astro Workshop");
      }
 });