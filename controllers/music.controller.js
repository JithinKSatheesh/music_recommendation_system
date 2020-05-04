const User = require("../models/user.model");
const Music = require("../models/music.model");
const Rating = require("../models/rating.model");
const middleware = require("../utils/middleware");

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended : false});

module.exports = function(app) {
    // update listen count
    // ******************************************************************

        app.get('/playback/:title',middleware.isLoggedin,(req,res)=>{

            var title = req.params.title
            Music.findOneAndUpdate({ title:title},{$inc:{listenCount: 1 }},{new: true })
                .populate({
                    path:'ratingRef' ,
                    match:{ username: req.user.username}
                    
                })
                .exec((err,data)=>{
                    if(err)
                    {
                        return res.redirect('/home')
                    }
                    User.findByIdAndUpdate(req.user.id,{$addToSet:{listenHistory : data.id}}).then((foundUser)=>{

                    }).catch(err=>{
                        console.log(err)
                    })
                    // res.redirect('assets/'+ title)
                    res.render('playMusic',{musicData:data})
                })
                
            
            
        })

        app.get('/play/:musicTitle',(req,res)=>{
            var musicTitle = req.params.musicTitle
            Music.findOne({title:musicTitle})
                .populate({
                    path:'ratingRef' ,
                    match:{ username: req.user.username}
                })
                .exec((err,data)=>{
                    if(err)
                    {
                        return res.redirect('/home')
                    }
                    res.render('playMusic',{musicData:data})
                })

        })

        // update rating
        // ******************************************************************

        app.get('/updateRating/:musicTitle/:rating/',(req,res)=>{

            Music.findOne({title:req.params.musicTitle})
            .then(music=>{
                var filter = {
                    userId:req.user.id,
                    title:music.id,
                    username:req.user.username,
                    title:music.title,
                }
                Rating.findOneAndUpdate(filter,{rating:req.params.rating},{
                    new: true,
                    upsert: true,
                    rawResult: true 
                  },function(err,result){
                     if(result.lastErrorObject.updatedExisting){
                        console.log("rating changed")
                     }
                     else{
                        music.ratingRef.push(result.value._id)
                        music.save(function(err){
                            if(err)
                            {
                                Rating.findByIdAndDelete(result.value._id)
                                return  res.redirect('/play/' + req.params.musicTitle)
                            }
                        })
                        User.findById(req.user.id,function(err,resultUser){
                            resultUser.ratedMusic.push(result.value._id)
                            resultUser.save(function(err){
                                if(err)
                                {
                                    Rating.findByIdAndDelete(result.value._id)
                                    return res.redirect('/play/' + req.params.musicTitle)
                                }
                            })
                        })

                        console.log("rating new")
                     }

                    Music.findOne({title:req.params.musicTitle})
                    .populate('ratingRef')
                    .exec((err,music_2)=>{
                            if(err)
                            {
                                return res.redirect('/play/'+req.params.musicTitle)
                            }
                            //  udating average rating
                            var rating_val = 0
                            var length = 0 
                            music_2.ratingRef.forEach(user=>{
                                rating_val += user.rating
                                length++
                            })
                            var new_rating = rating_val/length
                            music_2.rating = new_rating
                            console.log(music_2.rating)
                            music_2.save()

                            res.redirect('/play/'+req.params.musicTitle)
                    })
                
                  
                })
            
            })
        })  

        // uploading a new music
        // ******************************************************************
        app.get('/uploadMusic',(req,res)=>{
            res.render("uploadMusic")
        })

        app.post('/uploadMusic',urlencodedParser,(req,res)=>{
            // redirect if no file is found
            if(!req.files.musicFile|| Object.keys(req.files).length === 0)
            {
                return res.redirect('/uploadMusic')
            }

            let musicFile = req.files.musicFile
            let saveLocation = 'assets/Library/' + musicFile.name
            // saving file 
            musicFile.mv(saveLocation, function(err) {
                if (err){
                    console.log(err)
                    res.redirect('/uploadMusic')
                }
                else{ 
                    // music metadata  
                    var songId = req.body.title + Date()
                    let musicData = {
                        songId:songId,
                        title: req.body.title,
                        artist: req.body.artist,
                        genre: req.body.genre,
                        rating: req.body.rating,
                        ratingCount: 1,
                        listenCount: 0,
                        imageUrl: req.body.imageUrl,
                        fileUrl: musicFile.name,

                    }
                    // inserting data to database
                    Music.create(musicData)
                        .then((data)=>{
                            console.log(data)
                            res.redirect('/home')
                        }).catch((err)=>{
                            console.log(err)
                            res.redirect('/uploadMusic')
                        })
                }
                
            });

            
            
        })


 
}