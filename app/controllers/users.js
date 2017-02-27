/**
 *  users Controller
 *
 **/
(function () {
    "use strict";

    var q = require("q");
    var ld = require("lodash");
    var boom = require("boom");
    var db = require("../helpers/database");

    // Membres
    var UsersController = {
        list: list,
        show: show,
        update: update,
        create: create,
        destroy: destroy
    };

    // Functions
    /**
     * Index action, returns a list either
     *
     * @param {Object} data
     * @param {Object} opts
     * @return {Promise}
     **/
    function list (data, opts) {
        var User = db.model("User");
        var deferred = q.defer();

        opts = ld.extend({
            skip: 0,
            limit: 20,
            where: {}
        }, opts);
        opts.skip = opts.skip ? parseInt(opts.skip) - 1 : 0;
        opts.limit = opts.limit ? parseInt(opts.limit) : 20;

        // TODO: it needs implementation for search
        ld.extend(opts.where, data);

        User.all(opts, function (err, users) {
            if (err) {
                deferred.reject(boom.badRequest(err.message || err).output.payload);
            } else {
                deferred.resolve(users);
            }
        });
        return deferred.promise;
    }

    /**
     * Show action, returns shows a single user
     *
     * @param {Object} id of user
     * @return {Promise}
     **/
    function show (id) {
        var User = db.model("User");
        var deferred = q.defer();

        User.findById(id, function (err, user) {
            if (err) {
                deferred.reject(boom.badRequest(err.message || err).output.payload);
            } else if (!user) {
                deferred.reject(boom.notFound("user not found").output.payload);
            } else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    }

    /**
     * Update action, updates a single user
     *
     * @param {Object} data
     * @return {Promise}
     **/
    function update (data) {
        var User = db.model("User");
        var deferred = q.defer();

        show(data.id).then(function (user) {

            user = new User(ld.extend(user, data));

            user.isValid(function (isValid) {
                if(isValid) {
                    user.updateAttributes(data, function (err) {
                        if (err) {
                            deferred.reject(boom.badRequest(err.message || err).output.payload);
                        } else {
                            deferred.resolve(user);
                        }
                    });
                } else {
                    var error = boom.badData("data is bad you should fix it").output.payload;
                    error.attributes = user.errors;
                    deferred.reject(error);
                }
            });
        }, deferred.reject);
        return deferred.promise;
    }

    /**
     * Create action, creates a single user
     *
     * @param {Object} data
     * @return {Promise}
     **/
    function create (data) {
        var User = db.model("User");
        var user = new User(data);
        var deferred = q.defer();

        user.isValid(function (isValid) {
            if (!isValid) {
                var error = boom.badData("data is bad you should fix it").output.payload;
                error.attributes = user.errors;
                deferred.resolve(error);
            } else {
                user.save(function (err) {
                    if (err) {
                        deferred.reject(boom.badRequest(err.message || err).output.payload);
                    } else {
                        deferred.resolve(user.toObject());
                    }
                });
            }
        });
        return deferred.promise;
    }

    /**
     * Delete action, deletes a single user
     *
     * @param {Object} id of user
     **/
    function destroy (id) {
        var deferred = q.defer();

        show(id).then(function (user) {
            user.destroy(function (err) {
                if (err) {
                    deferred.reject(boom.badRequest(err.message || err).output.payload);
                } else {
                    deferred.resolve({
                        message: "user deleted!"
                    });
                }
            });
        }, deferred.reject);
        return deferred.promise;
    }

    module.exports = UsersController;

})();
