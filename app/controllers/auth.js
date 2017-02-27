(function () {
    "use strict";

    var TwitterStrategy = require("passport-twitter").Strategy;
    var db = require("../helpers/database");


    function passportSetup (passport, config) {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });
        passport.use(new TwitterStrategy({
            consumerKey: config.twitter.key,
            consumerSecret: config.twitter.secret,
            callbackURL: "/auth/twitter/callback"
        }, function (token, tokenSecret, profile, done) {
            var User = db.model("User");

            User.findOne({
                provider_id: profile.id,
                provider: profile.provider
            }, function (err, user) {
                if (err) {
                    throw err;
                } else if (!err && user) {
                    return done(null, user);
                } else {
                    User.create({
                        provider_id: profile.id,
                        provider: profile.provider,
                        token: token,
                        secret: tokenSecret,
                        name: profile.displayName,
                        avatar: profile.photos[0].value
                    }, function (err, user) {
                        if(err) {
                            throw err;
                        }
                        done(null, user);
                    });
                }
            });

        }));
    }

    module.exports = {
        passportSetup: passportSetup
    };

})();
