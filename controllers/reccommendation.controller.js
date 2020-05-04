const User = require("../models/user.model");
const Music = require("../models/music.model");

const middleware = require("../utils/middleware");

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended : false});

module.exports = function(app) {

    app.get('/home',middleware.isLoggedin,(req,res)=>{

            res.render('home')
    })

    // POPULARITY BASED RECCOMMENDATION SYSTEM
    // =======================================
    app.get('/popularitybased',(req,res)=>{
       console.log(req.user.name, " requesting popularity based reccommendation...")
        Music.find({})
            .sort({"listenCount":-1})
            .populate({
               path:'ratingRef' ,
               match:{ username: req.user.username},
               select:'rating -_id'
            })
            .exec((err,musicData)=>{
                if(err)
                {
                   return req.send("Something went wrong!")
                }
                console.log("sending popularity based reccommendation...")
                res.render("reccommend_popularity",{musicData:musicData})
            })
            
    })




    // a debugging tool
    app.get('/getuserdata',(req,res)=>{
        User.find()
            .populate('ratedMusic')
            .exec((err,currentUser)=>{
                res.send(currentUser)
            })

    })

    // USER BASED COLLABRATIVE FILTERING.
    // =================================
    app.get("/userbased",(req,res)=>{
        console.log( req.user.name ," requesting user based reccommendtaion...")
        User.findOne({username:req.user.username})
            .populate('ratedMusic')
            .exec((err,currentUser)=>{
                //Reading all user details except current user.
                User.find({$and:[

                    {"username":{$ne:currentUser.username}},
                    {"ratedMusic":{$ne: []}}
                    ]})
                    .populate('ratedMusic')
                    .exec((err,otherUser)=>{
                        var data = []
                        // Looping through all users
                        otherUser.forEach((user2)=>{  
                            
                            var common_1 = []
                            var common_2 = []
                            // merging current user and user[i] based on common rated songs.
                            user2.ratedMusic.forEach(ele2=>{
                                currentUser.ratedMusic.forEach(ele1=>{
                                    if(ele1.title == ele2.title){
                                        common_2.push(ele2)
                                        common_1.push(ele1)
                                    }
                                })
                            })
                            // pearson corellation method to find distance between two users.
                            // ==========================
                            // x[i] gives user1
                            // y[i] gives user2
                            
                            var u1_sum1 = 0
                            var u2_sum2 = 0
                            var u1_sq_sum1 = 0
                            var u2_sq_sum2 = 0
                            var prod_u1_u2 = 0

                            for(var i=0;i<common_2.length;i++)
                            {   
                                // finding sum ∑x and ∑y
                                u1_sum1 = u1_sum1 + common_1[i].rating
                                u2_sum2 = u2_sum2 + common_2[i].rating
                                // finding sum ∑x^ and ∑y^
                                u1_sq_sum1 = u1_sq_sum1 + Math.pow(common_1[i].rating,2)
                                u2_sq_sum2 = u2_sq_sum2 + Math.pow(common_2[i].rating,2)

                                 // finding ∑xy
                                 prod_u1_u2 =prod_u1_u2 + (common_1[i].rating * common_2[i].rating)

                            }
                          
                            // numerator
                            // ∑xy - (∑x*∑y)/n
                            var numerator = prod_u1_u2 - ((u1_sum1*u2_sum2)/common_2.length)

                            // denominator
                            // ∑x^ - (∑x)^/n *  ∑y^ - (∑y)^/n
                            var d1 = u1_sq_sum1 - (Math.pow(u1_sum1,2)/common_2.length)
                            var d2 = u2_sq_sum2 - (Math.pow(u2_sum2,2)/common_2.length)
                            var denominator = Math.sqrt(d1*d2)

                            var pearson_distance
                            if(denominator == 0){
                                pearson_distance = 0
                            }
                            else{
                                pearson_distance = numerator/denominator
                            }
                            // pushing distance between users to an array
                        
                            data.push({
                                "similarUser":user2.id,
                                "username"   :user2.username,
                                "name"       :user2.name,
                                "similarity":pearson_distance
                            })

                        })
                        // ranking users based on similarity
                        data.sort((a,b)=>{
                            return b.similarity - a.similarity
                        })
                        if(data.length == 0){
                            return res.send("Not enough data!")
                        }

                        console.log(req.user.name, "is similar to ",data[0].name, "with similarity of ",data[0].similarity)
                        console.log(data)

                        // populating details of most similar user
                        User.findOne({username: data[0].username})
                            .populate('listenHistory')
                            .exec((err,reccommendation)=>{
                                if(err){
                                    return res.send("Error in loading reccommendation!")
                                }
                                reccommendation.listenHistory.sort((a,b)=>{
                                   return  b.rating - a.rating
                                })
                                console.log("sending user based reccommendation...")
                                res.render('reccommend_userbased',{data:reccommendation})
                            })
                       

                        // data[0].populate('listenHistory').exec()

                    })
            })
            
    })

    // ITEM BASED COLLABRATIVE FILTERING.
    // =================================
    app.get('/itembased/:songid',(req,res)=>{
        
        Music.findOne({_id:req.params.songid})
        .then(music_1 =>{
           
            Music.find({_id:{$ne:req.params.songid}},(err,otherMusic)=>{
                var music_result = []
                if(err)
                {
                    console.log("errrrr")
                    return res.send("Something went wrong")
                    
                }
                
                otherMusic.forEach(music_2 =>{
                   if(music_2 != 'undefined'){
                        var sq_danceability = Math.pow(music_2.danceability - music_1.danceability,2)
                        var sq_energy = Math.pow(music_2.energy - music_1.energy,2)
                        var sq_loudness = Math.pow(music_2.loudness - music_1.loudness,2)
                        var sq_tempo = Math.pow(music_2.tempo - music_1.tempo,2)
                        var sq_speechiness = Math.pow(music_2.speechiness - music_1.speechiness,2)
                        var sq_acousticness = Math.pow(music_2.acousticness - music_1.acousticness,2)
                        var sq_liveness = Math.pow(music_2.liveness - music_1.liveness,2)
                        var sq_valence = Math.pow(music_2.valence - music_1.valence,2)
                        var euclid_distance = Math.sqrt(sq_danceability + sq_energy + sq_loudness + sq_tempo + sq_speechiness + sq_acousticness + sq_liveness + sq_valence)  
                        
                        var re_euclid = 1/(1+ euclid_distance)
                        // similar user have value close to 1
                        music_result.push({
                            "music": music_2,
                            "distance":re_euclid
                        })

                   }
                    
                })  
                music_result.sort((a,b)=>{
                    return b.distance - a.distance
                }) 
                res.render("reccommend_itembased",{musicData:music_result})
                // res.send(music_result)
            })
            

            
        })
    })


}