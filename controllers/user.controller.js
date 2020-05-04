const User = require("../models/user.model");

const passport = require("passport");
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended : false});

module.exports = function(app) {

    // User functions
    // ******************************************************************
        // register
        app.get('/register',(req,res)=>{
            res.render("register")
        })
        app.post('/register',urlencodedParser,(req,res,next)=>{
            let newUser = new User({
                name:req.body.name,
                username:req.body.username
            })

            User.register(newUser, req.body.password, (err, user) => {
                if (err) {
                    if (err.name === 'UserExistsError') {
                        // Duplicate email
                        console.log("error ! user already been registered.")
                    }
                    // Some other error
                    req.flash("error", "Something went wrong...")
                    console.log("error", err)
                    return res.redirect("/register")
                }
                passport.authenticate("local", function (err, user, info) {
                    if (err) {
                        console.log(err)
                        return next(err)
                    }
                    if (!user) return res.redirect('/login');

                    req.logIn(user, function (err) {
                        if (err) return next(err)
                        return res.redirect("/")
                    })

                })(req, res, next);
            })

        })
        // login
        app.get('/login',(req,res)=>{
            res.render('login',{"msg": req.flash("error")})
        })
        app.post('/login',urlencodedParser,(req,res,next)=>{
            passport.authenticate("local", (err, user, info) => {
                if (err) { return next(err); }
                if (!user) {
                    req.flash("error", "Invalid username or password")
                    console.log(req.flash("error"))
                    return res.redirect('/login')
                }
                req.logIn(user, err => {
                    if (err) { return next(err); }
                    console.log(user.name," is logged in")//TODO
                    res.redirect('/')
                });
            })(req, res, next);
        })
}