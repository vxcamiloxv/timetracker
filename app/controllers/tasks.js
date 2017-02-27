/**
 *  tasks Controller
 *
 **/
(function () {
    "use strict";

    var q = require("q");
    var ld = require("lodash");
    var boom = require("boom");
    var async = require("async");
    var db = require("../helpers/database");
    var logger = require("../helpers/logger");

    // Membres
    var TasksController = {
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
        var Task = db.model("Task");
        var deferred = q.defer();
        var log = logger.get();

        opts = ld.extend({
            skip: 0,
            limit: 20,
            where: {}
        }, opts);
        opts.skip = opts.skip ? parseInt(opts.skip) - 1 : 0;
        opts.limit = opts.limit ? parseInt(opts.limit) : 20;

        // TODO: it needs implementation for search
        ld.extend(opts.where, data);

        try {
            Task.find(opts, function (err, tasks) {
                if (err) {
                    deferred.reject(boom.badRequest(err.message || err).output.payload);
                } else {
                    deferred.resolve(tasks);
                }
            });
        } catch(e) {
            if (e.message.match("no indexes found")) {
                deferred.resolve([]);
            } else {
                log.fatal(e);
                deferred.reject(boom.badImplementation());
            }
        }
        return deferred.promise;
    }

    /**
     * Show action, returns shows a single task
     *
     * @param {Object} id of task
     * @return {Promise}
     **/
    function show (id) {
        var Task = db.model("Task");
        var deferred = q.defer();

        Task.findById(id, function (err, task) {
            if (err) {
                deferred.reject(boom.badRequest(err.message || err).output.payload);
            } else if (!task) {
                deferred.reject(boom.notFound("task not found").output.payload);
            } else {
                deferred.resolve(task);
            }
        });
        return deferred.promise;
    }

    /**
     * Update action, updates a single task
     *
     * @param {Object} data
     * @return {Promise}
     **/
    function update (data) {
        var Task = db.model("Task");
        var deferred = q.defer();

        show(data.id).then(function (task) {

            if (data.pause_at) {
                data.pause_at = new Date(data.pause_at);
            }
            if (data.start_at) {
                data.start_at = new Date(data.start_at);
            }
            if (data.end_at) {
                data.end_at = new Date(data.end_at);
            }
            task = new Task(ld.extend(task, data));

            task.isValid(function (isValid) {
                if(isValid) {
                    task.updateAttributes(data, function (err, algo) {
                        if (err) {
                            deferred.reject(boom.badRequest(err.message || err).output.payload);
                        } else {
                            deferred.resolve(task);
                        }
                    });
                } else {
                    var error = boom.badData("data is bad you should fix it").output.payload;
                    error.attributes = task.errors;
                    deferred.reject(error);
                }
            });
        }, deferred.reject);
        return deferred.promise;
    }

    /**
     * Create action, creates a single task
     *
     * @param {Object} data
     * @return {Promise}
     **/
    function create (data) {
        var Task = db.model("Task");
        var deferred = q.defer();

        async.series([
            function (callback) {
                if (data.pause_at) {
                    data.pause_at = new Date(data.pause_at);
                }
                if (data.start_at) {
                    data.start_at = new Date(data.start_at);
                }
                if (data.end_at) {
                    data.end_at = new Date(data.end_at);
                }
                if (data.name) {
                    return callback();
                }
                Task.count(function (err, count) {
                    data.name = "Task " + count;
                    callback(err);
                });
            },
            function (callback) {
                var task = new Task(data);
                task.isValid(function (isValid) {
                    if (!isValid) {
                        var error = boom.badData("data is bad you should fix it").output.payload;
                        error.attributes = task.errors;
                        return callback(error);
                    }
                    task.save(function (err) {
                        if (err) {
                            callback(boom.badRequest(err.message || err).output.payload);
                        } else {
                            callback(null, task.toObject());
                        }
                    });
                });
            }
        ], function (err, results) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(results[1]);
            }
        });
        return deferred.promise;
    }

    /**
     * Delete action, deletes a single task
     *
     * @param {Object} id of task
     **/
    function destroy (id) {
        var deferred = q.defer();

        show(id).then(function (task) {
            task.destroy(function (err) {
                if (err) {
                    deferred.reject(boom.badRequest(err.message || err).output.payload);
                } else {
                    deferred.resolve({
                        message: "task deleted!"
                    });
                }
            });
        }, deferred.reject);
        return deferred.promise;
    }

    module.exports = TasksController;

})();
