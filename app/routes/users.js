/**
 *  users Routes
 *
 **/
(function () {
    "use strict";

    var ld = require("lodash");
    var express = require("express");
    var usersCtl = require("../controllers/users");
    var api = express.Router({mergeParams: true});

    // params router level
    api.param("user_id", function (req, res, next, user_id) {
        if (/^\d+|me$/.test(user_id)) {
            next();
        } else {
            next("route");
        }
    });

    // all routes
    api.get("/", list);
    api.get("/:user_id", show);
    api.post("/", create);
    api.put("/:user_id", update);
    api.delete("/:user_id", destroy);


    // Functions
    /**
     * Index action, returns a list either
     * Default mapping to GET "~/users"
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function list (req, res) {
        var query = req.query;
        var opts = {
            skip: query.skip ? parseInt(query.skip) - 1 : 0,
            limit: query.limit ? parseInt(query.limit) : 20
        };

        delete query.skip;
        delete query.limit;

        usersCtl.list(query, opts).then(function (data)  {
            res.status(200);
            res.json(data);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Show action, returns shows a single user
     * Default mapping to GET "~/users/:id"
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function show (req, res) {
        if (req.path == "/me") {
            req.params.user_id = req.session.passport.user.id;
        }
        usersCtl.show(req.params.user_id).then(function (user) {
            res.status(200);
            res.json(user);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);

        });
    }

    /**
     * Update action, updates a single user
     * Default mapping to PUT "~/users/:id", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function update (req, res) {
        var data = ld.extend({
            id: req.params.user_id
        }, req.body);

        usersCtl.update(data).then(function (user) {
            res.status(200);
            res.json(user);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Create action, creates a single user
     * Default mapping to POST "~/users", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function create (req, res) {
        usersCtl.create(req.body).then(function (user) {
            res.status(201);
            res.json(user);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Delete action, deletes a single user
     * Default mapping to DEL "~/users/:id", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function destroy (req, res) {
        usersCtl.destroy(req.params.user_id).then(function (user) {
            res.status(204);
            res.json(user);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    module.exports = {
        api: api
    };

})();
