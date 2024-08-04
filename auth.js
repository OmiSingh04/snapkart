var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
let {get_user_by_name} = require('./db');

var router = express.Router();

passport.use(new LocalStrategy(function verify(username, password, cb) {
    get_user_by_name(username).then(
        (user) => {
            console.log("BRUH")
            if(!user) return cb(null, false, "Incorrect username or password");
            if(user.password !== password) return cb(null, false, "Incorrect username or password")
            return cb(null, user);
        }
    )
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, firstname: user.name.firstname, lastname : user.name.lastname });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {user : req.user});
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;