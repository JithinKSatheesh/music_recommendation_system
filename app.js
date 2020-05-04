// Attaching all dependencies
const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require('express-fileupload');
const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local');

var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

// getting models
const User = require("./models/user.model")
const Music = require("./models/music.model")

// controllers
const middleware = require("./utils/middleware")
const userController = require('./controllers/user.controller')
const musicController = require('./controllers/music.controller')
const reccommendationController = require('./controllers/reccommendation.controller')

// connect mongoose
mongoose.connect("mongodb://localhost/musicApp",{ useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB."))
    .catch(err => console.error("Could not connect to MongoDB."));

// configure express
const app = express()
app.use("/assets/css", express.static(__dirname + "/assets/css"));
app.use("/assets/js", express.static(__dirname + "/assets/js"));
app.use("/assets/img", express.static(__dirname + "/assets/img"));
app.use("/assets/Library", express.static(__dirname + "/assets/Library"));
app.use(bodyParser.urlencoded({extended : false}));
app.use(fileUpload());

app.set("view engine", "ejs");


//passport configuration
app.use(session({
	secret: process.env.SESSIONSECRET || "node_app_secret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());

// pass currentUser to all routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user; // req.user is an authenticated user
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});



// logout route
app.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged out seccessfully. Look forward to seeing you again!");
    res.redirect("/login");
});

// home page
// ===============================================================
// routing starts here
app.get('/',(req,res)=>{
    res.redirect('/home')
})

userController(app);
musicController(app);
reccommendationController(app);



// listening to port
app.listen(3000)