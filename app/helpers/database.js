(function () {
    "use strict";

    var q = require("q");
    var ld = require("lodash");
    var caminte = require("caminte");
    var models = require("../models");
    var logger = require("./logger");

    // Functions

    /**
     * This represent Database class
     * @constructor
     */
    function Database () {
        this.db = {};
        this.models = {};
    }

    /**
     * Database getInstance definition
     * @return Logger class
     */
    Database.instance = function () {
        if(!(this instanceof Database)) {
            return new Database();
        }
        return this;
    };
    // Prototype
    /**
     * @name init
     *
     * @description Create database and set models if database SQL are connected
     *
     * @param {Object} config  database config instance
     *
     * @return {Object} promise
     */
    Database.prototype.init = function (config) {
        var self = this;
        var log = logger.get();
        var deferred = q.defer();

        self.db = new caminte.Schema(config.driver, config);
        log.info("Run Database Adatpter: %s", config.driver);

        ld.forEach(models, function (model, key) {
            var _model = model(self.db);
            self.model(key, _model);
        });

        deferred.resolve({
            database: self.db,
            models: self.models
        });
        return deferred.promise;
    };

    /**
     * @name get
     *
     * @description Get Intence of Database
     *
     * @return {object} Database instance
     */
    Database.prototype.get = function () {
        return this.db;
    };

    /**
     * @name model
     * @description Set/Get model and collection in current connection
     *
     * @param name of model or collection
     * @param model instance of model or collection
     *
     * @returns {object} Model/Collections
     */
    Database.prototype.model = function (name, model) {
        if (name && model && !this.models[name]) {
            this.models[name] = model;
        } else {
            return this.models[name] || this.models;
        }
    };

    // Exports
    module.exports = Database.instance();
})();
