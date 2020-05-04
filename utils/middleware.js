

const middleware = {}

middleware.isLoggedin = function isLoggedin(req, res, next) {
    console.log("calling middleware... checking for authentication! ")
    if (req.isAuthenticated()) { return next(); }
    req.session.redirectTo = req.headers.referer || req.originalUrl || req.url
    // req.flash("error", "You need to be logged in first"); // add a one-time message before redirect
    res.redirect("/login");

  };

module.exports = middleware