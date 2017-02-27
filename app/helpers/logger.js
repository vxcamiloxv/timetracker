(function () {
    "use strict";

    var ld = require("lodash");
    var fs = require("fs");
    var path = require("path");
    var mkdirp = require("mkdirp");
    var uuid = require("node-uuid");
    var Logger  = require("bunyan");
    var fileStreamRotator = require("file-stream-rotator");

    // Logger vars
    var logServer = {
        name: "tracker",
        serializers: {
            req: Logger.stdSerializers.req,
            res: Logger.stdSerializers.res,
            err: function (err) {
                var obj = Logger.stdSerializers.err(err);
                // only show properties without an initial underscore
                return ld.pick(obj, ld.filter(ld.keys(obj), function (key) {
                    return key[0] != "_";
                }));
            }
        }
    };
    // Functions
    /**
     * @name AppLogger
     *
     * @description This represent logger class
     * @constructor
     */
    function AppLogger () {
        this.config = {};
        this.log = null;
        this.weblog = null;
        this.logAccess = {};
        this.logServer = logServer;
        this.logWeb = ld.clone(logServer);
    }
    /**
     * @name AppLogger.getInstance
     *
     * @description AppLogger getInstance definition
     *
     * @return AppLogger class
     */
    AppLogger.instance = function () {
        if(!(this instanceof AppLogger)) {
            return new AppLogger();
        }
        return this;
    };
    // Prototype
    /**
     * @name initLogger
     *
     * @description Run intance of Logger buyan and configure morgar(express),
     * check if debug or nologger
     * @param {Object} configuration file
     *
     * @return {Object} logger intance
     */
    AppLogger.prototype.init = function (config) {
        var self = this,
            accessPath,
            accessLogStream;

        if(config) {
            self.config = config;
            accessPath =  path.resolve(self.config.logPath, "./access/");

            if (config.logPath && config.enviroment != "development" && !config.nologger) {
                // ensure log path exists
                if(!fs.existsSync(config.logPath) || !fs.existsSync(accessPath)) {
                    mkdirp.sync(accessPath);
                }
                // Access create a rotating write stream to morgan
                accessLogStream = fileStreamRotator.getStream({
                    filename: accessPath + "/access-%DATE%.log",
                    frequency: "daily", // Every day
                    date_format: "YYYY-MM-DD",
                    verbose: false
                });
                // Set options
                self.logServer.streams = [{path: path.resolve(config.logPath, "server.log")}];
                self.logWeb.streams = [{path: path.resolve(config.logPath, "access.log")}];
                // Independent log acces for express with morgan middleware
                self.logAccess.streams = {stream: accessLogStream};
                self.logAccess.format = "combined";
            } else if (config.nologger) {
                self.logServer.streams = [{path: "/dev/null"}];
                self.logWeb.streams = [{path: "/dev/null"}];
                self.logAccess.streams = {stream: null};
                self.logAccess.format = false;
            } else {
                self.logServer.streams = [{stream: process.stderr}];
                self.logWeb.streams = [{stream: process.stderr}];
                self.logAccess.streams = {stream: process.stdout};
                self.logAccess.format = "dev";
            }
            self.logServer.streams[0].level = config.logLevel;
            self.logWeb.streams[0].level = config.logLevel;
            // Create new logger buyan
            self.log = new Logger(self.logServer);
            self.weblog = new Logger(self.logWeb);
            return self.log;

        } else {
            return new Error("Need configuration for init Logger");
        }
    };
    /**
     * @name get
     *
     * @description Get Intence of Logger
     *
     * @return {object} buyan logger instance
     */
    AppLogger.prototype.get = function () {
        return this.log;
    };
    /**
     * @name reqLogger
     *
     * @description Logger for request server http or https for express 4.x
     *
     * @return {Function} logger request function
     */
    AppLogger.prototype.logRequest = function () {
        var self = this;
        return function (req, res, next) {
            var rec,
                endTime,
                weblog = self.weblog.child({"req_id": uuid.v4(), component: "web"}),
                end = res.end,
                startTime = Date.now();
            req.log = weblog;
            res.end = function (chunk, encoding) {
                res.end = end;
                res.end(chunk, encoding);
                endTime = Date.now();
                rec = {req: req, res: res, serverTime: endTime - startTime};

                weblog.info(rec);
            };
            next();
        };
    };
    /**
     * @name logAccess
     *
     * @description Configuration for logger morgan access
     *
     * @return {Object} config params
     */
    AppLogger.prototype.logAccess = function () {
        return this.logAccess;
    };
    // Exports
    module.exports = AppLogger.instance();
})();
