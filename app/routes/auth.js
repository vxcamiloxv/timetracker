/**
 *  auth Routes
 *
 **/
(function () {
    "use strict";

    var express = require("express");
    var passport = require("passport");
    // var boom = require("boom");
    var auth = express.Router({mergeParams: true});


    auth.get("/twitter", passport.authenticate("twitter"));
    auth.get("/twitter/callback", passport.authenticate("twitter", {
        successRedirect: "/",
        failureRedirect: "/login"
    }));
    auth.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    module.exports = auth;

})();
