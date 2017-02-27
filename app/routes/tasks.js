/**
 *  tasks Routes
 *
 **/
(function () {
    "use strict";

    var ld = require("lodash");
    var express = require("express");
    var tasksCtl = require("../controllers/tasks");
    var api = express.Router({mergeParams: true});

    // params router level
    api.param("task_id", function (req, res, next, task_id) {
        if (/^\d+$/.test(task_id)) {
            next();
        } else {
            next("route");
        }
    });

    // all routes
    api.get("/", list);
    api.get("/:task_id", show);
    api.post("/", create);
    api.put("/:task_id", update);
    api.delete("/:task_id", destroy);


    // Functions
    /**
     * Index action, returns a list either
     * Default mapping to GET "~/tasks"
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

        tasksCtl.list(query, opts).then(function (data)  {
            res.status(200);
            res.json(data);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Show action, returns shows a single task
     * Default mapping to GET "~/tasks/:id"
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function show (req, res) {
        if (req.path == "/me") {
            req.params.task_id = req.session.passport.task.id;
        }
        tasksCtl.show(req.params.task_id).then(function (task) {
            res.status(200);
            res.json(task);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);

        });
    }

    /**
     * Update action, updates a single task
     * Default mapping to PUT "~/tasks/:id", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function update (req, res) {
        var data = ld.extend({
            id: req.params.task_id
        }, req.body);

        tasksCtl.update(data).then(function (task) {
            res.status(200);
            res.json(task);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Create action, creates a single task
     * Default mapping to POST "~/tasks", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function create (req, res) {
        tasksCtl.create(req.body).then(function (task) {
            res.status(201);
            res.json(task);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    /**
     * Delete action, deletes a single task
     * Default mapping to DEL "~/tasks/:id", no GET mapping
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    function destroy (req, res) {
        tasksCtl.destroy(req.params.task_id).then(function (task) {
            res.status(204);
            res.json(task);
        }, function (err) {
            res.status(err.statusCode || 500);
            res.json(err);
        });
    }

    module.exports = {
        api: api
    };

})();
